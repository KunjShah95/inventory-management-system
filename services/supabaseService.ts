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
      // also mirror cost back to price fields so subsequent updates affect DB column whichever it is
      if (r.cost != null) {
        if (r.price == null) r.price = r.cost;
        if (r.unit_price == null) r.unit_price = r.cost;
      }
      return r;
    });
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    // Ensure we send both possible column names so DB captures the value regardless of schema
    const payload: any = { ...product };
    if (payload.cost != null) {
      if (payload.price == null) payload.price = payload.cost;
      if (payload.unit_price == null) payload.unit_price = payload.cost;
    } else if (payload.price != null) {
      if (payload.cost == null) payload.cost = payload.price;
      if (payload.unit_price == null) payload.unit_price = payload.price;
    }

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
    if (payload.cost != null) {
      if (payload.price == null) payload.price = payload.cost;
      if (payload.unit_price == null) payload.unit_price = payload.cost;
    } else if (payload.price != null) {
      if (payload.cost == null) payload.cost = payload.price;
      if (payload.unit_price == null) payload.unit_price = payload.price;
    }

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