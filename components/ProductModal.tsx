import React, { useState, useEffect, useRef } from 'react';
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
    cost: 1
  });
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ product_name: '', quantity: 1, cost: 0 });
    }
    setQuantityError(null);
    setCostError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || (formData.quantity == null) || formData.quantity < 1) {
      setQuantityError('Please enter a quantity of at least 1');
      return;
    }
    if (formData.cost == null || formData.cost < 1) {
      setCostError('Cost must be at least 1');
      return;
    }
    setQuantityError(null);
    setCostError(null);
    onSave(formData);
  };

  const totalValue = ((formData.quantity || 0) * (formData.cost || 0)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-blue-500 to-blue-600 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className={`fas ${product ? 'fa-pen' : 'fa-plus'} text-white text-lg`}></i>
              </div>
              <h2 className="text-xl font-bold text-white">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              required
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="input"
              placeholder="e.g., iPhone 15 Pro Max"
            />
          </div>

          {/* Quantity & Cost Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const qty = Number.isNaN(val) ? 1 : Math.max(1, val);
                  setFormData({ ...formData, quantity: qty });
                  setQuantityError(qty < 1 ? 'Min quantity is 1' : null);
                }}
                className={`input ${quantityError ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="1"
              />
              {quantityError && (
                <p className="text-xs text-red-600 mt-1 font-medium">{quantityError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Unit Cost (₹) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="1"
                value={formData.cost}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const cost = Number.isNaN(val) ? 0 : val;
                  setFormData({ ...formData, cost });
                  setCostError(cost < 1 ? 'Cost must be at least 1' : null);
                }}
                className={`input ${costError ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="0.00"
              />
              {costError && (
                <p className="text-xs text-red-600 mt-1 font-medium">{costError}</p>
              )}
            </div>
          </div>

          {/* Total Value Display */}
          <div className="bg-linear-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Total Inventory Value</span>
              <span className="text-2xl font-bold text-slate-900">₹{totalValue}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 py-3"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!quantityError || !!costError}
              className={`btn btn-primary flex-1 py-3 shadow-lg ${
                (quantityError || costError) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <i className={`fas ${product ? 'fa-check' : 'fa-plus'} mr-2`}></i>
              {product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;