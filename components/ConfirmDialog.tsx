import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirm Action',
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 border-b border-red-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-triangle-exclamation text-white text-lg"></i>
            </div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-700 text-sm leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary flex-1 py-2.5"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger flex-1 py-2.5"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;