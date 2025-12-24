
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import * as XLSX from 'xlsx';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  onBulkSave?: (rows: Partial<Product>[]) => Promise<void>;
  product?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    quantity: 1,
    cost: 0
  });
  const [previewRows, setPreviewRows] = useState<Partial<Product>[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
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

  const handleFile = async (file: File | null) => {
    if (!file) return;
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      // Map rows to Partial<Product>
      const rows: Partial<Product>[] = json.map(r => ({
        product_name: String(r['product_name'] || r['Product Name'] || r['name'] || r['product_name']).trim(),
        quantity: Number(r['quantity'] ?? r['Quantity'] ?? r['qty'] ?? 0) || 0,
        cost: parseFloat(String(r['cost'] ?? r['Cost'] ?? r['price'] ?? r['unit_price'] ?? 0)) || 0
      }));
      setPreviewRows(rows);
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to parse file', err);
      setPreviewRows([]);
      setShowPreview(false);
    }
  };

  const updateRow = (index: number, patch: Partial<Product>) => {
    setPreviewRows(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
  };

  const handleBulkSave = async () => {
    if (!onBulkSave) return;
    setBulkConfirmOpen(false);
    try {
      await onBulkSave(previewRows.map(r => ({
        ...r,
        product_id: r.product_id || Math.random().toString(36).slice(2, 11)
      })));
      setPreviewRows([]);
      setShowPreview(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving uploaded rows: ' + (err as any)?.message || 'Unknown');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`bg-white w-full ${showPreview ? 'max-w-4xl' : 'max-w-md'} rounded-3xl shadow-2xl overflow-auto max-h-[90vh] animate-in fade-in zoom-in duration-200`}>
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
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">Upload Excel (optional)</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
              className="w-full"
              title="Upload Excel/CSV file"
              aria-label="Upload Excel or CSV file"
            />
            <p className="text-xs text-gray-400 mt-1">Upload an Excel/CSV with columns: product_name, quantity, cost</p>
          </div>
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
            {showPreview && previewRows.length > 0 && (
              <button
                type="button"
                onClick={() => setBulkConfirmOpen(true)}
                className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                Preview & Save ({previewRows.length})
              </button>
            )}
          </div>
        </form>
        {showPreview && previewRows.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="font-bold mb-3">Preview and edit rows</h3>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-2 py-1">#</th>
                    <th className="px-2 py-1">Product Name</th>
                    <th className="px-2 py-1">Quantity</th>
                    <th className="px-2 py-1">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1 align-top">{i+1}</td>
                      <td className="px-2 py-1">
                        <input value={row.product_name || ''} onChange={(e) => updateRow(i, { product_name: e.target.value })} className="w-full px-2 py-1 border rounded" placeholder="Product name" title="Product name" aria-label={`Product name ${i+1}`} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" min="0" value={String(row.quantity ?? '')} onChange={(e) => updateRow(i, { quantity: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded" placeholder="Quantity" title="Quantity" aria-label={`Quantity ${i+1}`} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" step="0.01" min="0" value={String(row.cost ?? '')} onChange={(e) => updateRow(i, { cost: parseFloat(e.target.value) || 0 })} className="w-32 px-2 py-1 border rounded" placeholder="Cost" title="Cost" aria-label={`Cost ${i+1}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {bulkConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
              <h4 className="font-bold text-lg">Confirm upload</h4>
              <p className="text-sm text-gray-600 mt-2">You are about to save <strong>{previewRows.length}</strong> rows to the inventory. This will create or update products as needed. Proceed?</p>
              <div className="mt-4 flex justify-end space-x-3">
                <button onClick={() => setBulkConfirmOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button onClick={handleBulkSave} className="px-4 py-2 bg-emerald-600 text-white rounded">Confirm and Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
