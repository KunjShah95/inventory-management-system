
import React from 'react';
import { Product } from '../types';

interface InventoryTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (name: string) => void;
  loading: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onEdit, onDelete, loading }) => {
  const getStatus = (qty: number) => {
    if (qty <= 0) return { label: 'Out of Stock', class: 'bg-rose-100 text-rose-700' };
    if (qty < 10) return { label: 'Low Stock', class: 'bg-amber-100 text-amber-700' };
    return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="card rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Inventory Catalog</h2>
          <p className="text-xs text-slate-400 font-medium">Manage your products and stock levels</p>
        </div>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-slate-200">
          {products.length} Products
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Stock Status</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Unit Price</th>
              <th className="px-6 py-4">Total Value</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && products.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-6"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-box-open text-2xl text-slate-300"></i>
                    </div>
                    <p className="font-semibold text-slate-500">Inventory Empty</p>
                    <p className="text-sm">Start by adding your first product.</p>
                  </div>
                </td>
              </tr>
            ) : products.map((product) => {
              const status = getStatus(product.quantity);
              return (
                <tr key={product.product_id} className="hover:bg-slate-50/80 group transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shadow-sm">
                        {product.product_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{product.product_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">#{product.product_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{product.quantity.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-500">${(product.cost || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">
                      ${((product.quantity || 0) * (product.cost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm transition-all"
                        aria-label={`Edit ${product.product_name}`}
                        title={`Edit ${product.product_name}`}
                      >
                        <i className="fas fa-pen-to-square"></i>
                      </button>
                      <button 
                        type="button"
                        onClick={() => onDelete(product.product_name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm transition-all"
                        aria-label={`Delete ${product.product_name}`}
                        title={`Delete ${product.product_name}`}
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
