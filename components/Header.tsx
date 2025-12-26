import React from 'react';

interface HeaderProps {
  onAddClick: () => void;
  onBuyClick?: () => void;
  onExportClick?: () => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAddClick, onBuyClick, onExportClick, onSearchChange, onRefresh, loading }) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-md">
              <i className="fas fa-boxes-stacked text-white text-lg sm:text-xl"></i>
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Smart Stock</h1>
              <p className="text-xs text-slate-500 font-medium">Inventory & Insights</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md min-w-0 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400 text-sm"></i>
              </div>
              <input
                type="search"
                placeholder="Search products..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="input pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400"
                aria-label="Search products"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn btn-ghost p-2 sm:px-3 sm:py-2 rounded-lg"
              aria-label="Refresh inventory"
              title="Refresh"
            >
              <i className={`fas fa-arrows-rotate text-sm sm:text-base ${loading ? 'animate-spin' : ''}`}></i>
              <span className="hidden sm:inline text-sm">Refresh</span>
            </button>
            
            <button
              onClick={onBuyClick}
              disabled={!onBuyClick}
              className="btn btn-success p-2 sm:px-4 sm:py-2.5 rounded-lg hidden sm:flex"
              aria-label="Upload Excel"
              title="Bulk Upload"
            >
              <i className="fas fa-file-arrow-up text-sm"></i>
              <span className="text-sm font-semibold">Upload</span>
            </button>

            <button
              onClick={onExportClick}
              disabled={!onExportClick}
              className="btn btn-ghost p-2 sm:px-4 sm:py-2.5 rounded-lg hidden sm:flex border border-slate-200"
              aria-label="Export Excel"
              title="Export to Excel"
            >
              <i className="fas fa-file-export text-sm text-slate-600"></i>
              <span className="text-sm font-semibold text-slate-600">Export</span>
            </button>

            <button
              onClick={onAddClick}
              className="btn btn-primary px-3 py-2.5 sm:px-4 rounded-lg shadow-md hover:shadow-lg"
              aria-label="Add Product"
              title="Add Product"
            >
              <i className="fas fa-plus text-sm"></i>
              <span className="text-sm font-semibold">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-400 text-sm"></i>
            </div>
            <input
              type="search"
              placeholder="Search products..."
              onChange={(e) => onSearchChange(e.target.value)}
              className="input pl-10 pr-4 py-2.5 text-sm w-full placeholder:text-slate-400"
              aria-label="Search products"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;