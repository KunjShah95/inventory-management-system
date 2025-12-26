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
        product_name: String(r['product_name'] || r['Product Name'] || r['name'] || r['product_name']).trim(),
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
    setPreviewRows(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
  };

  const handleBulkSave = async () => {
    if (!onBulkSave) return;
    setConfirmOpen(false);
    try {
      await onBulkSave(previewRows.map(r => ({ ...r, product_id: r.product_id || Math.random().toString(36).slice(2, 11) })));
      setPreviewRows([]);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving uploaded rows: ' + (err as any)?.message || 'Unknown');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-auto max-h-[90vh] animate-in fade-in zoom-in duration-200`}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Excel Upload</h2>
          <button onClick={onClose} aria-label="Close dialog" title="Close" className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-times text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">Upload file</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)} className="w-full" title="Upload Excel/CSV file" aria-label="Upload Excel or CSV file" />
            <p className="text-xs text-gray-400 mt-1">Upload an Excel/CSV with columns: product_name, quantity, cost</p>
          </div>

          {previewRows.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Preview and edit rows</h3>
              <div className="overflow-x-auto max-h-[50vh]">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-2 py-1">#</th>
                      <th className="px-2 py-1">Product Name</th>
                      <th className="px-2 py-1">Quantity</th>
                      <th className="px-2 py-1">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1 align-top">{i+1}</td>
                        <td className="px-2 py-1">
                          <input value={row.product_name || ''} onChange={(e) => updateRow(i, { product_name: e.target.value })} className="w-full px-2 py-1 border rounded" placeholder="Product name" title="Product name" aria-label={`Product name ${i+1}`} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="number" min="0" value={String(row.quantity ?? '')} onChange={(e) => updateRow(i, { quantity: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded" placeholder="Quantity" title="Quantity" aria-label={`Quantity ${i+1}`} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="number" step="0.01" min="0" value={String(row.cost ?? '')} onChange={(e) => updateRow(i, { cost: parseFloat(e.target.value) || 0 })} className="w-32 px-2 py-1 border rounded" placeholder="Cost" title="Cost" aria-label={`Cost ${i+1}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button onClick={() => setPreviewRows([])} className="px-4 py-2 bg-gray-100 rounded">Clear</button>
                <button onClick={() => setConfirmOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded">Confirm and Save ({previewRows.length})</button>
              </div>
            </div>
          )}
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
              <h4 className="font-bold text-lg">Confirm upload</h4>
              <p className="text-sm text-gray-600 mt-2">You are about to save <strong>{previewRows.length}</strong> rows to the inventory. This will create or update products as needed. Proceed?</p>
              <div className="mt-4 flex justify-end space-x-3">
                <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button onClick={handleBulkSave} className="px-4 py-2 bg-emerald-600 text-white rounded">Confirm and Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;
