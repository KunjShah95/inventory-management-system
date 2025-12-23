
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <i className="fas fa-boxes-stacked text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">SmartStock</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon="fa-chart-pie" label="Dashboard" active />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-semibold text-xs">JD</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Inventory Admin</p>
            <p className="text-xs text-slate-400 truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <i className={`fas ${icon} w-5`}></i>
    <span className="font-medium text-sm">{label}</span>
  </div>
);

export default Sidebar;
