
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
            <i className="fas fa-database text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connect Database</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your Supabase credentials to synchronize your inventory records.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Supabase Project URL</label>
            <input 
              required
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Anon/Public API Key</label>
            <input 
              required
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              className="input"
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary w-full py-4 text-base shadow-lg shadow-blue-500/20"
          >
            <i className="fas fa-rocket mr-2"></i>
            Launch Dashboard
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Make sure your database has an <code className="bg-slate-50 px-1.5 py-0.5 rounded text-blue-600 font-mono">active_products</code> table.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
