
import React, { useState } from 'react';
import { SupabaseConfig } from '../types';

interface SetupScreenProps {
  onComplete: (config: SupabaseConfig) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      onComplete({ url, anonKey: key });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 rotate-3">
            <i className="fas fa-database text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Connect Database</h1>
          <p className="text-gray-500 mt-2">Enter your Supabase credentials to synchronize your inventory records.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Supabase Project URL</label>
            <input 
              required
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Anon/Public API Key</label>
            <input 
              required
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            Launch Dashboard
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            Make sure your database has an <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600">active_products</code> table.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
