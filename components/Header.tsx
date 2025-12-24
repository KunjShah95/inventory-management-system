
import React from 'react';

interface HeaderProps {
  onAddClick: () => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAddClick, onSearchChange, onRefresh, loading }) => {
  return (
    <header className="bg-transparent border-b border-transparent py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-semibold">Smart Stock</div>
            <div className="text-xs muted">Inventory & Insights</div>
          </div>
        </div>

        <div className="mx-6 w-80">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="search" placeholder="Search products, ids or tags..." onChange={(e)=>onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onAddClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-sm font-semibold hover:bg-indigo-700 shadow-sm"
            aria-label="Add Product"
            title="Add Product"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Product
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
