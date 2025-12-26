import React, { useState } from 'react';
import { Product } from '../types';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkSave?: (rows: Partial<Product>[]) => Promise<void>;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ isOpen, onClose, onBulkSave }) => {
  const [processing, setProcessing] = useState(false);
  const [previewRows, setPreviewRows] = useState<Partial<Product>[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setProcessing(true);
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const rows: Partial<Product>[] = json.map(r => ({
        product_name: String(r['product_name'] || r['Product Name'] || r['name'] || '').trim(),
        quantity: Number(r['quantity'] ?? r['Quantity'] ?? r['qty'] ?? 0) || 0,
        cost: parseFloat(String(r['cost'] ?? r['Cost'] ?? r['price'] ?? r['unit_price'] ?? 0)) || 0
      }));
      setPreviewRows(rows);
    } catch (err) {
      console.error('Failed to parse file', err);
      setPreviewRows([]);
    } finally {
      setProcessing(false);
    }
  };

  const updateRow = (index: number, patch: Partial<Product>) => {
    setPreviewRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const handleBulkSave = async () => {
    if (!onBulkSave) return;
    setConfirmOpen(false);
    try {
      await onBulkSave(previewRows);
      setPreviewRows([]);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving uploaded rows: ' + ((err as any)?.message || 'Unknown'));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-scale-in">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 border-b border-emerald-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-file-excel text-white text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-white">Bulk Upload</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Upload Section */}
            <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 transition-colors">
              <div className="text-center mb-4">
                <i className="fas fa-cloud-arrow-up text-4xl text-slate-400 mb-3"></i>
                <h3 className="font-semibold text-slate-700 mb-1">Upload Excel or CSV File</h3>
                <p className="text-sm text-slate-500">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                aria-label="Upload Excel or CSV file"
              />
              <p className="text-xs text-slate-400 mt-3 text-center">
                Required columns: <code className="bg-white px-2 py-0.5 rounded text-emerald-600 font-mono">product_name</code>,{' '}
                <code className="bg-white px-2 py-0.5 rounded text-emerald-600 font-mono">quantity</code>,{' '}
                <code className="bg-white px-2 py-0.5 rounded text-emerald-600 font-mono">cost</code>
              </p>
            </div>

            {/* Preview Section */}
            {previewRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">Preview & Edit ({previewRows.length} rows)</h3>
                  <button
                    onClick={() => setPreviewRows([])}
                    className="btn btn-ghost text-xs px-3 py-1.5"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Clear All
                  </button>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-80 scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">#</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Product Name</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Quantity</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-500 font-mono text-xs">{i + 1}</td>
                            <td className="px-3 py-2">
                              <input
                                value={row.product_name || ''}
                                onChange={(e) => updateRow(i, { product_name: e.target.value })}
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                placeholder="Product name"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={row.quantity ?? ''}
                                onChange={(e) => updateRow(i, { quantity: parseInt(e.target.value) || 0 })}
                                className="w-24 px-2 py-1 border border-slate-200 rounded focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.cost ?? ''}
                                onChange={(e) => updateRow(i, { cost: parseFloat(e.target.value) || 0 })}
                                className="w-32 px-2 py-1 border border-slate-200 rounded focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                placeholder="0.00"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="btn btn-success px-6 py-2.5 shadow-lg"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Confirm & Save ({previewRows.length})
                  </button>
                </div>
              </div>
            )}

            {processing && (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-3xl text-emerald-500 mb-3"></i>
                <p className="text-slate-600 font-medium">Processing file...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-check text-emerald-600 text-xl"></i>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Confirm Upload</h4>
            </div>
            <p className="text-sm text-slate-600 text-center mb-6">
              You are about to save <strong className="text-emerald-600">{previewRows.length} products</strong> to the inventory.
              This will create or update products as needed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSave}
                className="btn btn-success flex-1 py-2.5"
              >
                <i className="fas fa-check mr-2"></i>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelUpload;