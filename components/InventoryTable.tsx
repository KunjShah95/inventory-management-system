import React from 'react';
import { Product } from '../types';

interface InventoryTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (name: string) => void;
  onRestore?: (name: string) => void;
  onCheck?: (product: Product) => void;
  viewMode: 'active' | 'inactive' | 'all';
  onChangeView: (v: 'active' | 'inactive' | 'all') => void;
  loading: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEdit,
  onDelete,
  onRestore,
  onCheck,
  viewMode,
  onChangeView,
  loading
}) => {
  const getStatus = (qty: number) => {
    if (qty <= 0) return { label: 'Out of Stock', class: 'badge-danger', dot: 'status-dot-danger' };
    if (qty < 10) return { label: 'Low Stock', class: 'badge-warning', dot: 'status-dot-warning' };
    return { label: 'In Stock', class: 'badge-success', dot: 'status-dot-success' };
  };

  const displayed = products.filter(p => {
    if (viewMode === 'active') return p.isActive !== false;
    if (viewMode === 'inactive') return p.isActive === false;
    return true;
  });

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Inventory Catalog
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your products and stock levels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeView('active')}
              className={`btn px-3 py-2 text-xs sm:text-sm rounded-lg transition-all ${
                viewMode === 'active'
                  ? 'btn-primary shadow-md'
                  : 'btn-ghost'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onChangeView('inactive')}
              className={`btn px-3 py-2 text-xs sm:text-sm rounded-lg transition-all ${
                viewMode === 'inactive'
                  ? 'btn-primary shadow-md'
                  : 'btn-ghost'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => onChangeView('all')}
              className={`btn px-3 py-2 text-xs sm:text-sm rounded-lg transition-all ${
                viewMode === 'all'
                  ? 'btn-primary shadow-md'
                  : 'btn-ghost'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                Product Details
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                Unit Price
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                Total Value
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading && displayed.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="h-10 skeleton w-48"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="h-6 skeleton w-20"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="h-6 skeleton w-16"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="h-6 skeleton w-20"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="h-6 skeleton w-24"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="h-8 skeleton w-20 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-box-open text-2xl text-slate-300"></i>
                    </div>
                    <p className="font-semibold text-slate-700 mb-1">No Products Found</p>
                    <p className="text-sm text-slate-500">
                      {viewMode === 'active' ? 'Start by adding your first product' : `No ${viewMode} products`}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayed.map((product) => {
                const active = product.isActive !== false;
                const status = getStatus(product.quantity);
                return (
                  <tr
                    key={product.product_id}
                    className={`group hover:bg-slate-50 transition-colors ${!active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                            {product.product_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-mono">
                              #{product.product_id}
                            </span>
                            {!active && (
                              <span className="badge badge-danger text-xs px-2 py-0.5">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${status.dot}`}></span>
                        <span className={`badge ${status.class} text-xs`}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {product.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <span className="text-sm font-medium text-slate-600">
                        ₹{(product.cost || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{((product.quantity || 0) * (product.cost || 0)).toLocaleString(undefined, {
                          minimumFractionDigits: 2
                        })}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(product)}
                          disabled={!active}
                          className={`btn p-2 rounded-lg transition-all ${
                            !active
                              ? 'opacity-30 cursor-not-allowed'
                              : 'btn-ghost hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          aria-label={`Edit ${product.product_name}`}
                          title="Edit"
                        >
                          <i className="fas fa-pen text-sm"></i>
                        </button>
                        {active ? (
                          <button
                            onClick={() => onDelete(product.product_name)}
                            className="btn btn-ghost p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                            aria-label={`Delete ${product.product_name}`}
                            title="Delete"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestore && onRestore(product.product_name)}
                            className="btn btn-ghost p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                            aria-label={`Restore ${product.product_name}`}
                            title="Restore"
                          >
                            <i className="fas fa-rotate-left text-sm"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {displayed.length > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-slate-50/50 border-t border-slate-100">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{displayed.length}</span> {viewMode} product{displayed.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;