
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, SupabaseConfig } from './types';
import { SupabaseService } from './services/supabaseService';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import InventoryTable from './components/InventoryTable';
import ProductModal from './components/ProductModal';
import SetupScreen from './components/SetupScreen';
import ActivityFeed from './components/ActivityFeed';

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'check';
  message: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [config] = useState<SupabaseConfig | null>(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (url && anonKey) {
      return { url, anonKey };
    }
    return null;
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = useMemo(() => config ? new SupabaseService(config) : null, [config]);

  const addActivity = (type: Activity['type'], message: string) => {
    setActivities(prev => [{
      id: Math.random().toString(36).substring(7),
      type,
      message,
      timestamp: new Date()
    }, ...prev].slice(0, 10));
  };

  const refreshInventory = useCallback(async (quiet = false) => {
    if (!supabase) return;
    if (!quiet) setLoading(true);
    try {
      const data = await supabase.fetchProducts();
      setProducts(data);
    } catch (err: any) {
      console.error(err.message);
      alert(`Error fetching inventory: ${err.message}`);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (config) refreshInventory();
  }, [config, refreshInventory]);

  const handleSaveProduct = async (data: Partial<Product>) => {
    if (!supabase) return;
    try {
      if (editingProduct) {
        await supabase.updateProduct(editingProduct.product_name, data);
        addActivity('update', `Manually updated ${editingProduct.product_name}`);
      } else {
        await supabase.createProduct({
          ...data,
          product_id: Math.random().toString(36).substring(2, 11)
        });
        addActivity('create', `Manually added ${data.product_name}`);
      }
      refreshInventory(true);
      setIsModalOpen(false);
      setEditingProduct(undefined);
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (name: string) => {
    if (!supabase || !window.confirm(`Delete ${name} from inventory?`)) return;
    try {
      await supabase.deleteProduct(name);
      addActivity('delete', `Deleted product: ${name}`);
      refreshInventory(true);
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  // Chatbot removed: AI command processing disabled

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500 rounded-3xl mx-auto flex items-center justify-center text-white mb-6">
            <i className="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-4">Configuration Missing</h1>
          <p className="text-gray-600 mb-6">
            Please set the following environment variables in your <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env</code> file:
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm font-mono space-y-2 mb-6">
            <div className="text-gray-700">VITE_SUPABASE_URL</div>
            <div className="text-gray-700">VITE_SUPABASE_ANON_KEY</div>
          </div>
          <p className="text-xs text-gray-400">
            Check the .env.example file for reference
          </p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onAddClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} 
          onSearchChange={setSearchQuery}
          onRefresh={() => refreshInventory()}
          loading={loading}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <section className="card hero-bg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">Smart Stock — fast, clear inventory for teams</h1>
                <p className="mt-2 text-sm muted">Track stock, get alerts, and make smarter purchasing decisions with simple tools and realtime sync.</p>
                <div className="mt-4 flex items-center space-x-3">
                  <button onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} className="px-4 py-2 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-500 text-white font-semibold">Add Product</button>
                  <button onClick={() => refreshInventory()} className="px-4 py-2 rounded-2xl border border-slate-100 bg-white text-slate-700">Refresh</button>
                </div>
              </div>

              <div className="w-full md:w-72 bg-white card p-4 text-center">
                <div className="text-sm muted">Total Products</div>
                <div className="text-2xl font-extrabold mt-2">{products.length}</div>
                <div className="text-xs muted mt-1">Updated live</div>
              </div>
            </section>

            <StatsCards products={products} />
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-12 space-y-8">
                <InventoryTable 
                  products={filteredProducts} 
                  onEdit={(p) => { setEditingProduct(p); setIsModalOpen(true); }}
                  onDelete={handleDeleteProduct}
                  loading={loading}
                />
                <ActivityFeed activities={activities} />
              </div>
              
            </div>
          </div>
        </main>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
};

export default App;
