
import React from 'react';

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'check';
  message: string;
  timestamp: Date;
}

const ActivityFeed: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create': return 'fa-circle-plus text-emerald-500';
      case 'update': return 'fa-rotate text-blue-500';
      case 'delete': return 'fa-circle-minus text-rose-500';
      case 'check': return 'fa-eye text-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
        <i className="fas fa-stream text-slate-300 mr-2"></i>
        Recent Activity
      </h2>
      
      <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-4">No recent activity recorded.</p>
        ) : activities.map((activity) => (
          <div key={activity.id} className="relative pl-4 flex items-start">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{activity.message}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
