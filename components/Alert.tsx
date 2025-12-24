import React, { useEffect } from 'react';

interface AlertProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(t);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto bg-white max-w-lg w-full mx-auto rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
        <div className="text-sm text-slate-700">{message}</div>
        <div className="mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">OK</button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
