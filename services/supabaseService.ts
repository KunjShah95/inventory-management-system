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

  async fetchProducts(): Promise<Product[]> {
    const response = await fetch(`${this.config.url}/rest/v1/active_products?select=*&order=product_name.asc`, {
      headers: this.headers
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to fetch inventory: ${error.message || response.statusText}`);
    }
    const rows = await response.json();
      // Normalize price field: some schemas use `price` or `unit_price` while app expects `cost`.
      return rows.map((r: any) => {
        if (r.cost == null && r.price != null) r.cost = r.price;
        if (r.cost == null && r.unit_price != null) r.cost = r.unit_price;
        return r;
      });
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    // Ensure we send both possible column names so DB captures the value regardless of schema
    const payload: any = { ...product };
    // Enforce minimum quantity of 1
    if (payload.quantity == null || payload.quantity < 1) payload.quantity = 1;
      // Send only the properties supplied by the caller. Avoid mirroring to alternative column
      // names (like `price`/`unit_price`) — some schemas don't have those columns and will error.
      const tryRequest = async (body: any) => {
        const response = await fetch(`${this.config.url}/rest/v1/active_products`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body)
        });
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
        // If server complains about a missing column, strip unknown price-like fields and retry once.
        if (/Could not find the '\\w+' column|column .* does not exist|missing column/i.test(msg)) {
          const cleaned = { ...payload };
          delete cleaned.price;
          delete cleaned.unit_price;
          res = await tryRequest(cleaned);
        }
      }

      if (!res.ok) {
        const err = res.error || { message: 'Unknown error' };
        throw new Error(`Failed to create product: ${err.message || JSON.stringify(err)}`);
      }
      return res.data[0];

    const response = await fetch(`${this.config.url}/rest/v1/active_products`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to create product: ${error.message || error.hint || response.statusText}`);
    }
    const data = await response.json();
    return data[0];
  }

  async updateProduct(name: string, updates: Partial<Product>): Promise<Product> {
    // Mirror cost/price fields to increase chance DB column is updated regardless of naming
    const payload: any = { ...updates };
    // Enforce minimum quantity of 1 when updating
    if (payload.quantity != null && payload.quantity < 1) payload.quantity = 1;
      // Send only the provided update fields and avoid mirroring to alternative column names
      const tryRequest = async (body: any) => {
        const response = await fetch(`${this.config.url}/rest/v1/active_products?product_name=eq.${encodeURIComponent(name)}`, {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify(body)
        });
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
          res = await tryRequest(cleaned);
        }
      }

      if (!res.ok) {
        const err = res.error || { message: 'Unknown error' };
        throw new Error(`Failed to update product: ${err.message || JSON.stringify(err)}`);
      }
      return res.data[0];

    const response = await fetch(`${this.config.url}/rest/v1/active_products?product_name=eq.${encodeURIComponent(name)}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to update product: ${error.message || error.hint || response.statusText}`);
    }
    const data = await response.json();
    return data[0];
  }

  async deleteProduct(name: string): Promise<void> {
    const response = await fetch(`${this.config.url}/rest/v1/active_products?product_name=eq.${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to delete product: ${error.message || error.hint || response.statusText}`);
    }
  }
}