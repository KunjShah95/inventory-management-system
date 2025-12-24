
import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  product?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    quantity: 1,
    cost: 0
  });
  const [quantityError, setQuantityError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ product_name: '', quantity: 1, cost: 0 });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || (formData.quantity == null) || formData.quantity < 1) {
      setQuantityError('Please enter a quantity of at least 1');
      return;
    }
    setQuantityError(null);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} aria-label="Close dialog" title="Close" className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-times text-xl" aria-hidden="true"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">Product Name</label>
            <input 
              required
              type="text" 
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g., iPhone 15 Pro"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">Quantity</label>
              <input 
                required
                type="number" 
                min="1"
                  value={formData.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const qty = Number.isNaN(val) ? 1 : val;
                    const clamped = Math.max(1, qty);
                    setFormData({ ...formData, quantity: clamped });
                    if (qty < 1) setQuantityError('Please enter a quantity of at least 1');
                    else setQuantityError(null);
                  }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="1"
              />
                {quantityError && <p className="text-xs text-rose-600 mt-1">{quantityError}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">Unit Cost (Rs)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!!quantityError}
              className={`flex-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all ${quantityError ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {product ? 'Update Details' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
