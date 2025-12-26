import React, { useEffect } from 'react';

interface AlertProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 pointer-events-none animate-fade-in">
      <div className="pointer-events-auto bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-circle-info text-white text-lg"></i>
            </div>
            <h3 className="font-bold text-white text-lg">Notice</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-700 text-sm leading-relaxed mb-6">{message}</p>
          <button
            onClick={onClose}
            className="btn btn-primary w-full py-2.5"
          >
            <i className="fas fa-check mr-2"></i>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;