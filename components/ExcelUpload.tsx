import React, { useState } from 'react';
import { Product } from '../types';

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
      // Load XLSX from CDN to keep bundle size small
      if (!(window as any).XLSX) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const XLSX = (window as any).XLSX;
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const rows: Partial<Product>[] = json.map((r: any) => ({
        product_name: String(r['product_name'] || r['Product Name'] || r['name'] || '').trim(),
        quantity: Number(r['quantity'] ?? r['Quantity'] ?? r['qty'] ?? 1) || 1,
        cost: parseFloat(String(r['cost'] ?? r['Cost'] ?? r['price'] ?? r['unit_price'] ?? 1)) || 1
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

    // Validate rows before saving
    const invalidRows = previewRows.filter(r => !r.product_name || (r.quantity || 0) < 1 || (r.cost || 0) < 1);
    if (invalidRows.length > 0) {
      alert(`Please fix ${invalidRows.length} invalid rows. All products must have a name, quantity >= 1, and cost >= 1.`);
      return;
    }

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
          <div className="px-6 py-5 bg-linear-to-r from-blue-600 to-indigo-600 border-b border-blue-700">
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
            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-arrow-up text-3xl text-blue-500"></i>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Upload Excel or CSV File</h3>
                <p className="text-sm text-slate-500">
                  Supported formats: .xlsx, .xls, .csv
                </p>
                <button
                  onClick={async () => {
                    if (!(window as any).XLSX) {
                      await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                      });
                    }
                    const XLSX = (window as any).XLSX;
                    const ws = XLSX.utils.json_to_sheet([
                      { product_name: 'Sample Product', quantity: 10, cost: 150.00 }
                    ]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Template');
                    XLSX.writeFile(wb, 'inventory_template.xlsx');
                  }}
                  className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                >
                  Download Template
                </button>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition-all"
                aria-label="Upload Excel or CSV file"
              />
              <p className="text-xs text-slate-400 mt-4 text-center">
                Required columns: <code className="bg-white px-2 py-0.5 rounded text-blue-600 font-mono border border-slate-100">product_name</code>,{' '}
                <code className="bg-white px-2 py-0.5 rounded text-blue-600 font-mono border border-slate-100">quantity</code>,{' '}
                <code className="bg-white px-2 py-0.5 rounded text-blue-600 font-mono border border-slate-100">cost</code>
              </p>
            </div>

            {/* Preview Section */}
            {previewRows.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Preview & Edit 
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{previewRows.length} rows</span>
                  </h3>
                  <button
                    onClick={() => setPreviewRows([])}
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <i className="fas fa-trash-alt"></i>
                    Clear All
                  </button>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-80 scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Product Name</th>
                          <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                            <td className="px-4 py-3">
                              <input
                                value={row.product_name || ''}
                                onChange={(e) => updateRow(i, { product_name: e.target.value })}
                                className="input py-1.5 text-sm"
                                placeholder="Product name"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={row.quantity ?? ''}
                                onChange={(e) => updateRow(i, { quantity: parseInt(e.target.value) || 1 })}
                                className="input py-1.5 text-sm w-24"
                                placeholder="1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                value={row.cost ?? ''}
                                onChange={(e) => updateRow(i, { cost: parseFloat(e.target.value) || 1 })}
                                className="input py-1.5 text-sm w-32"
                                placeholder="1.00"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="btn btn-primary px-8 py-3 shadow-lg shadow-blue-500/20"
                  >
                    <i className="fas fa-check-circle mr-2"></i>
                    Confirm & Save
                  </button>
                </div>
              </div>
            )}

            {processing && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-bold">Processing file...</p>
                <p className="text-xs text-slate-400 mt-1">Reading spreadsheet data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cloud-upload-alt text-blue-600 text-2xl"></i>
              </div>
              <h4 className="font-black text-xl text-slate-900">Confirm Upload</h4>
              <p className="text-sm text-slate-500 mt-2">
                You are about to save <strong className="text-blue-600">{previewRows.length} products</strong> to the inventory.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSave}
                className="btn btn-primary flex-1 py-3"
              >
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