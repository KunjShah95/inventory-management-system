
export interface Product {
  product_id: string;
  product_name: string;
  quantity: number;
  cost: number;
  isActive?: boolean;
  created_at?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  uniqueProducts: number;
}

export interface AIActionResponse {
  action: 'check' | 'create' | 'update' | 'delete' | null;
  product: string | null;
  quantity_change: number | null;
  update_type: 'set' | 'increment' | 'decrement' | null;
  cost: number | null;
  ai_text: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
