import React from 'react';
import { Product } from '../types';

const StatsCards: React.FC<{ products: Product[] }> = ({ products }) => {
  const stats = {
    totalItems: products.reduce((acc, p) => acc + (p.quantity || 0), 0),
    totalValue: products.reduce((acc, p) => acc + ((p.quantity || 0) * (p.cost || 0)), 0),
    lowStock: products.filter(p => (p.quantity != null && p.quantity < 10)).length,
    uniqueProducts: products.length
  };

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="h-3 bg-slate-100 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <StatCard
        label="Total Units"
        value={stats.totalItems.toLocaleString()}
        icon="fa-box-open"
        gradient="from-blue-500 to-blue-600"
        trend="+12% from last month"
        trendUp={true}
      />
      <StatCard
        label="Inventory Value"
        value={`₹${stats.totalValue.toLocaleString()}`}
        icon="fa-indian-rupee-sign"
        gradient="from-emerald-500 to-emerald-600"
        trend="+5.4% growth"
        trendUp={true}
      />
      <StatCard
        label="Low Stock Alerts"
        value={stats.lowStock.toString()}
        icon="fa-triangle-exclamation"
        gradient="from-amber-500 to-amber-600"
        trend="Requires attention"
        warning={stats.lowStock > 0}
      />
      <StatCard
        label="Total Products"
        value={stats.uniqueProducts.toString()}
        icon="fa-tags"
        gradient="from-indigo-500 to-indigo-600"
        trend="Active SKUs"
        trendUp={false}
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  gradient: string;
  trend: string;
  warning?: boolean;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, trend, warning, trendUp }) => (
  <div className="card card-hover p-6 group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </p>
        <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${warning ? 'text-amber-600' : 'text-slate-900'}`}>
          {value}
        </h3>
      </div>
      <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl shadow-md group-hover:shadow-lg transition-shadow`}>
        <i className={`fas ${icon} text-white text-lg`}></i>
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs">
      {trendUp !== undefined && (
        <span className={trendUp ? 'text-emerald-600' : 'text-slate-400'}>
          {trendUp && <i className="fas fa-arrow-trend-up mr-1"></i>}
        </span>
      )}
      <span className={warning ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
        {trend}
      </span>
    </div>
  </div>
);

export default StatsCards;