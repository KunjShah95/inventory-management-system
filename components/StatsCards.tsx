
import React from 'react';
import { Product } from '../types';

const StatsCards: React.FC<{ products: Product[] }> = ({ products }) => {
  const stats = {
    totalItems: products.reduce((acc, p) => acc + (p.quantity || 0), 0),
    totalValue: products.reduce((acc, p) => acc + ((p.quantity || 0) * (p.cost || 0)), 0),
    lowStock: products.filter(p => p.quantity < 10).length,
    uniqueProducts: products.length
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard 
        label="Total Units" 
        value={stats.totalItems.toLocaleString()} 
        icon="fa-box" 
        color="bg-blue-500" 
        trend="+12% from last month"
      />
      <StatCard 
        label="Inventory Value" 
        value={`$${stats.totalValue.toLocaleString()}`} 
        icon="fa-dollar-sign" 
        color="bg-emerald-500" 
        trend="+5.4% growth"
      />
      <StatCard 
        label="Low Stock Alerts" 
        value={stats.lowStock.toString()} 
        icon="fa-triangle-exclamation" 
        color="bg-amber-500" 
        trend="Requires attention"
        warning={stats.lowStock > 0}
      />
      <StatCard 
        label="Products" 
        value={stats.uniqueProducts.toString()} 
        icon="fa-tags" 
        color="bg-indigo-500" 
        trend="Active SKU list"
      />
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  icon: string; 
  color: string; 
  trend: string;
  warning?: boolean;
}> = ({ label, value, icon, color, trend, warning }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${warning ? 'text-amber-600' : 'text-gray-900'}`}>{value}</h3>
      </div>
      <div className={`${color} p-3 rounded-2xl shadow-lg shadow-gray-200`}>
        <i className={`fas ${icon} text-white text-lg`}></i>
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs">
      <span className={warning ? 'text-amber-500 font-semibold' : 'text-gray-400'}>{trend}</span>
    </div>
  </div>
);

export default StatsCards;
