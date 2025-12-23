
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
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold">SS</div>
          <div>
            <div className="text-sm font-semibold">Smart Stock</div>
            <div className="text-xs muted">Inventory & Insights</div>
          </div>
        </div>

        <div className="flex-1 mx-6">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="search" placeholder="Search products, ids or tags..." onChange={(e)=>onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={onRefresh} title="Refresh" className={`p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}>
            <i className="fas fa-sync-alt"></i>
          </button>

          <button onClick={onAddClick} className="px-4 py-2 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-500 text-white font-semibold shadow-lg hover:opacity-95 transition-all">
            <i className="fas fa-plus mr-2"></i>
            Add
          </button>

          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">JS</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
