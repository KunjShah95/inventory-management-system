import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title = 'Confirm', message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">{message}</p>
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg font-semibold">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
