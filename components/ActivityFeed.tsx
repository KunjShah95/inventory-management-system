
import React from 'react';

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'check';
  message: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create': return { icon: 'fa-plus', color: 'bg-emerald-100 text-emerald-600' };
      case 'update': return { icon: 'fa-pen', color: 'bg-blue-100 text-blue-600' };
      case 'delete': return { icon: 'fa-trash', color: 'bg-red-100 text-red-600' };
      case 'check': return { icon: 'fa-check-double', color: 'bg-indigo-100 text-indigo-600' };
      default: return { icon: 'fa-info', color: 'bg-slate-100 text-slate-600' };
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900">Recent Activity</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 10 events</span>
      </div>
      
      <div className="space-y-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const { icon, color } = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex gap-4">
                <div className={`shrink-0 w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                  <i className={`fas ${icon} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">
                    {activity.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
