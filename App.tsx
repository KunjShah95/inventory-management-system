
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, SupabaseConfig } from './types';
import { SupabaseService } from './services/supabaseService';

import Header from './components/Header';
import StatsCards from './components/StatsCards';
import InventoryTable from './components/InventoryTable';
import ProductModal from './components/ProductModal';
import SetupScreen from './components/SetupScreen';
import ActivityFeed from './components/ActivityFeed';
import ConfirmDialog from './components/ConfirmDialog';
import Alert from './components/Alert';

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
  const [viewMode, setViewMode] = useState<'active' | 'inactive' | 'all'>('active');
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

  const refreshInventory = useCallback(async (show: 'active' | 'inactive' | 'all' = viewMode, quiet = false) => {
    if (!supabase) return;
    if (!quiet) setLoading(true);
    try {
      const data = await supabase.fetchProducts(show);
      setProducts(data);
    } catch (err: any) {
      console.error(err.message);
      showAlert(`Error fetching inventory: ${err.message}`);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [supabase, viewMode]);

  useEffect(() => {
    if (config) refreshInventory();
  }, [config, refreshInventory]);

  useEffect(() => {
    // refresh when view mode changes
    refreshInventory(viewMode, true);
  }, [viewMode, refreshInventory]);

  const handleSaveProduct = async (data: Partial<Product>) => {
    if (!supabase) return;
    if (data.quantity == null || data.quantity < 1) {
      showAlert('Please enter a quantity of at least 1 before saving.');
      return;
    }
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
      refreshInventory(viewMode, true);
      setIsModalOpen(false);
      setEditingProduct(undefined);
    } catch (err: any) {
      showAlert('Error saving product: ' + err.message);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  const requestDeleteProduct = (name: string) => {
    setPendingDeleteName(name);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    const name = pendingDeleteName;
    setConfirmOpen(false);
    setPendingDeleteName(null);
    if (!supabase || !name) return;
    try {
      await supabase.deleteProduct(name);
      addActivity('delete', `Moved to inactive: ${name}`);
      refreshInventory(viewMode, true);
    } catch (err: any) {
      showAlert('Error deleting product: ' + err.message);
    }
  };

  const handleRestoreProduct = async (name: string) => {
    if (!supabase) return;
    try {
      await supabase.restoreProduct(name);
      addActivity('update', `Restored product: ${name}`);
      refreshInventory(viewMode, true);
    } catch (err: any) {
      showAlert('Error restoring product: ' + err.message);
    }
  };

  // App-level alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setAlertMessage('');
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteName(null);
  };

  const handleCheckProduct = (product: Product) => {
    // Minimal check action: record activity and refresh inventory (no quantity change)
    addActivity('check', `Checked inventory for ${product.product_name}`);
    refreshInventory(viewMode, true);
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onAddClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} 
          onSearchChange={setSearchQuery}
          onRefresh={() => refreshInventory()}
          loading={loading}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="space-y-8">
            

            <StatsCards products={products} />
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-12 space-y-8">
                <InventoryTable 
                  products={filteredProducts} 
                  onEdit={(p) => { setEditingProduct(p); setIsModalOpen(true); }}
                  onDelete={requestDeleteProduct}
                  onRestore={handleRestoreProduct}
                  viewMode={viewMode}
                  onChangeView={(v) => setViewMode(v)}
                  onCheck={handleCheckProduct}
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
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Product"
        message={pendingDeleteName ? `Are you sure you want to delete ${pendingDeleteName}?` : 'Are you sure you want to delete this product?'}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleCancelDelete}
      />
      <Alert isOpen={alertOpen} message={alertMessage} onClose={closeAlert} />
    </div>
  );
};

export default App;
