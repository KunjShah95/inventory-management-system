import { Product, SupabaseConfig } from '../types';

export class SupabaseService {
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
  }

  private get headers() {
    return {
      'apikey': this.config.anonKey,
      'Authorization': `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  // show: 'active' | 'inactive' | 'all' — defaults to 'active'
  async fetchProducts(show: 'active' | 'inactive' | 'all' = 'active'): Promise<Product[]> {
    const activeUrl = `${this.config.url}/rest/v1/active_products?select=*&order=product_name.asc`;
    const productsBase = `${this.config.url}/rest/v1/products`;
    let url = '';
    // For 'active' prefer the view; for other modes, fetch from base table without using isActive filters
    if (show === 'active') {
      // Prefer querying the base products table with an isActive filter
      // This ensures 'active' view only returns active products when the column exists.
      let response = await fetch(`${productsBase}?isActive=eq.true&select=*&order=product_name.asc`, { headers: this.headers });
      if (!response.ok) {
        // If the DB doesn't have isActive or the filtered query fails, try the active_products view next
        response = await fetch(activeUrl, { headers: this.headers });
      }
      if (!response.ok) {
        // Final fallback: return all products and let client-side filtering handle isActive if present
        response = await fetch(`${productsBase}?select=*&order=product_name.asc`, { headers: this.headers });
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to fetch inventory: ${error.message || response.statusText}`);
      }
      const rows = await response.json();
      // Normalize and ensure isActive defaults to true when absent
      const normalized = rows.map((r: any) => {
        if (r.cost == null && r.price != null) r.cost = r.price;
        if (r.cost == null && r.unit_price != null) r.cost = r.unit_price;
        // Normalize isActive to a real boolean. Treat null/undefined as true (active).
        if (r.isActive == null) {
          r.isActive = true;
        } else {
          const v = r.isActive;
          r.isActive = (
            v === true || v === 1 || v === '1' ||
            String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 't'
          );
        }
        return r;
      });
      // Only return active products for the 'active' view
      return normalized.filter((r: any) => (r.isActive !== false));
    }

    // For 'inactive' or 'all' — fetch all products and let the client filter by isActive.
    const response = await fetch(`${productsBase}?select=*&order=product_name.asc`, { headers: this.headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to fetch inventory: ${error.message || response.statusText}`);
    }
    const rows = await response.json();
    // Normalize price field and ensure isActive defaults to true when absent.
    const normalized = rows.map((r: any) => {
      if (r.cost == null && r.price != null) r.cost = r.price;
      if (r.cost == null && r.unit_price != null) r.cost = r.unit_price;
      // Normalize isActive to a boolean; default to true when absent
      if (r.isActive == null) {
        r.isActive = true;
      } else {
        const v = r.isActive;
        r.isActive = (
          v === true || v === 1 || v === '1' ||
          String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 't'
        );
      }
      return r;
    });
    // If caller requested inactive products, return only those marked inactive.
    if (show === 'inactive') return normalized.filter((r: any) => r.isActive === false);
    // show === 'all' -> return everything
    return normalized;
  }

  async bulkUpsertProducts(products: Partial<Product>[]): Promise<void> {
    if (products.length === 0) return;

    const response = await fetch(`${this.config.url}/rest/v1/products`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(products)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to bulk upsert products: ${error.message || response.statusText}`);
    }
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    // Ensure we send both possible column names so DB captures the value regardless of schema
    const payload: any = { ...product };
    // Enforce minimum quantity of 1
    if (payload.quantity == null || payload.quantity < 1) payload.quantity = 1;
    // ensure newly created products are active by default
    if (payload.isActive == null) payload.isActive = true;
      // Send only the properties supplied by the caller. Avoid mirroring to alternative column
      // names (like `price`/`unit_price`) — some schemas don't have those columns and will error.
      const tryRequest = async (body: any) => {
        // Prefer inserting into base `products` table. Only fallback to `active_products`
        // for unusual setups where the view accepts writes.
        let response = await fetch(`${this.config.url}/rest/v1/products`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          // fall back to active_products view if available
          response = await fetch(`${this.config.url}/rest/v1/active_products`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(body)
          });
        }
        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: response.statusText }));
          return { ok: false, error: err };
        }
        const data = await response.json();
        return { ok: true, data };
      };

      // First attempt
      let res = await tryRequest(payload);
      if (!res.ok) {
        const msg = (res.error && (res.error.message || JSON.stringify(res.error))).toString();
        // If server complains about a missing column, strip unknown fields and retry once.
        if (/Could not find the '\\w+' column|column .* does not exist|missing column/i.test(msg)) {
          const cleaned = { ...payload };
          // remove alternative price fields which may not exist
          delete cleaned.price;
          delete cleaned.unit_price;
          // also remove isActive if the DB does not have that column
          if (/isActive/i.test(msg) || /'isActive'/.test(msg)) delete cleaned.isActive;
          res = await tryRequest(cleaned);
        }
      }

      if (!res.ok) {
        const err = res.error || { message: 'Unknown error' };
        throw new Error(`Failed to create product: ${err.message || JSON.stringify(err)}`);
      }
      return res.data[0];
  }

  async updateProduct(name: string, updates: Partial<Product>): Promise<Product> {
    // Mirror cost/price fields to increase chance DB column is updated regardless of naming
    const payload: any = { ...updates };
    // Enforce minimum quantity of 1 when updating
    if (payload.quantity != null && payload.quantity < 1) payload.quantity = 1;
      // Send only the provided update fields and avoid mirroring to alternative column names
      const tryRequest = async (body: any) => {
        // Prefer patching the base `products` table. Avoid patching views by default.
        let response = await fetch(`${this.config.url}/rest/v1/products?product_name=eq.${encodeURIComponent(name)}`, {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          // as a last resort, try the view (not recommended for most setups)
          response = await fetch(`${this.config.url}/rest/v1/active_products?product_name=eq.${encodeURIComponent(name)}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(body)
          });
        }
        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: response.statusText }));
          return { ok: false, error: err };
        }
        const data = await response.json();
        return { ok: true, data };
      };

      let res = await tryRequest(payload);
      if (!res.ok) {
        const msg = (res.error && (res.error.message || JSON.stringify(res.error))).toString();
        if (/Could not find the '\\w+' column|column .* does not exist|missing column/i.test(msg)) {
          const cleaned = { ...payload };
          delete cleaned.price;
          delete cleaned.unit_price;
          if (/isActive/i.test(msg) || /'isActive'/.test(msg)) delete cleaned.isActive;
          res = await tryRequest(cleaned);
        }
      }

      if (!res.ok) {
        const err = res.error || { message: 'Unknown error' };
        throw new Error(`Failed to update product: ${err.message || JSON.stringify(err)}`);
      }
      return res.data[0];
  }

  // Soft delete: mark isActive = false
  async deleteProduct(name: string): Promise<void> {
    // Patch the base `products` table only. Views often don't expose writable columns
    // like `isActive`. If this fails, surface a clear error message rather than
    // attempting to write to a view that may not support updates.
    const response = await fetch(`${this.config.url}/rest/v1/products?product_name=eq.${encodeURIComponent(name)}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ isActive: false })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      const msg = (error && (error.message || JSON.stringify(error))) || response.statusText;
      // If the failure is due to missing `isActive` column, fall back to hard DELETE
      if (/isActive/i.test(msg) || /Could not find the '\\w+' column/.test(msg) || /column .* does not exist/i.test(msg)) {
        const delResp = await fetch(`${this.config.url}/rest/v1/products?product_name=eq.${encodeURIComponent(name)}`, {
          method: 'DELETE',
          headers: this.headers
        });
        if (!delResp.ok) {
          const derr = await delResp.json().catch(() => ({ message: delResp.statusText }));
          throw new Error(`Failed to delete product (hard delete attempted): ${derr.message || delResp.statusText}`);
        }
        return;
      }
      throw new Error(`Failed to delete (soft) product: ${error.message || error.hint || response.statusText}`);
    }
  }

  // Restore a soft-deleted product
  async restoreProduct(name: string): Promise<void> {
    const response = await fetch(`${this.config.url}/rest/v1/products?product_name=eq.${encodeURIComponent(name)}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ isActive: true })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to restore product: ${error.message || error.hint || response.statusText}`);
    }
  }
}