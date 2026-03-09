import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle,
  AlertTriangle, Download, ArrowLeft, Trash2, RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ImportRow {
  id?: string;
  product_name: string;
  mrp: number;
  tagline: string;
  description_en: string;
  description_mr: string;
  description_hi: string;
  benefits: string;
  category: string;
  dosage: string;
  recommended_crops: string;
  product_image: string;
  available_states: string;
  status: string;
  trending_product: boolean;
  best_seller: boolean;
  import_status?: string;
  error_message?: string;
}

type Step = 'upload' | 'preview' | 'processing' | 'results';

export const AdminBulkUpload = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [batchId, setBatchId] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState({ total: 0, success: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const parseBoolean = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    const s = String(val || '').toLowerCase().trim();
    return ['true', 'yes', '1', 'y'].includes(s);
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File too large. Max 5MB allowed.');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      if (jsonData.length === 0) {
        toast.error('No data found in the Excel file.');
        setIsUploading(false);
        return;
      }

      if (jsonData.length > 500) {
        toast.error('Max 500 rows allowed per upload.');
        setIsUploading(false);
        return;
      }

      const parsed: ImportRow[] = jsonData.map((row) => ({
        product_name: String(row.product_name || row.name || '').trim(),
        mrp: parseFloat(row.mrp || row.MRP || '0') || 0,
        tagline: String(row.tagline || '').trim(),
        description_en: String(row.description_en || row.description || '').trim(),
        description_mr: String(row.description_mr || '').trim(),
        description_hi: String(row.description_hi || '').trim(),
        benefits: String(row.benefits || '').trim(),
        category: String(row.category || 'fertilizers').trim().toLowerCase(),
        dosage: String(row.dosage || '').trim(),
        recommended_crops: String(row.recommended_crops || row.crops || '').trim(),
        product_image: String(row.product_image || row.image_url || '').trim(),
        available_states: String(row.available_states || row.states || '').trim(),
        status: String(row.status || 'active').trim().toLowerCase(),
        trending_product: parseBoolean(row.trending_product || row.is_trending),
        best_seller: parseBoolean(row.best_seller || row.is_best_seller),
      }));

      setRows(parsed);
      setStep('preview');
    } catch (err: any) {
      toast.error('Failed to parse file: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const validateRow = (row: ImportRow): string | null => {
    if (!row.product_name) return 'Product name is required';
    const validCats = ['fertilizers', 'biostimulants', 'pesticides', 'plant-protection'];
    if (!validCats.includes(row.category)) return `Invalid category: ${row.category}`;
    if (!['active', 'draft'].includes(row.status)) return `Invalid status: ${row.status}`;
    return null;
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    setStep('processing');

    const newBatchId = crypto.randomUUID();
    setBatchId(newBatchId);

    let successCount = 0;
    let failedCount = 0;
    const BATCH_SIZE = 50;

    try {
      // Insert into temp table in batches
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE).map((row) => {
          const error = validateRow(row);
          return {
            batch_id: newBatchId,
            product_name: row.product_name,
            mrp: row.mrp,
            tagline: row.tagline || null,
            description_en: row.description_en || null,
            description_mr: row.description_mr || null,
            description_hi: row.description_hi || null,
            benefits: row.benefits || null,
            category: row.category,
            dosage: row.dosage || null,
            recommended_crops: row.recommended_crops || null,
            product_image: row.product_image || null,
            available_states: row.available_states || null,
            status: row.status,
            trending_product: row.trending_product,
            best_seller: row.best_seller,
            import_status: error ? 'error' : 'validated',
            error_message: error,
          };
        });

        const { error } = await supabase.from('product_import_temp').insert(batch);
        if (error) throw error;
      }

      // Now move validated records to products table
      const { data: validRows, error: fetchErr } = await supabase
        .from('product_import_temp')
        .select('*')
        .eq('batch_id', newBatchId)
        .eq('import_status', 'validated');

      if (fetchErr) throw fetchErr;

      for (let i = 0; i < (validRows || []).length; i += BATCH_SIZE) {
        const batch = (validRows || []).slice(i, i + BATCH_SIZE);
        const products = batch.map((r: any) => {
          // Parse crops and states from comma-separated or JSON
          let crops: string[] = [];
          let states: string[] = [];
          try { crops = JSON.parse(r.recommended_crops); } catch { crops = (r.recommended_crops || '').split(',').map((s: string) => s.trim()).filter(Boolean); }
          try { states = JSON.parse(r.available_states); } catch { states = (r.available_states || '').split(',').map((s: string) => s.trim()).filter(Boolean); }

          const benefitsList = (r.benefits || '').split(/[;\n]/).map((b: string) => b.trim()).filter(Boolean);

          // Build translations object
          const translations: Record<string, any> = {};
          if (r.description_mr) translations.mr = { title: r.product_name, message: r.description_mr };
          if (r.description_hi) translations.hi = { title: r.product_name, message: r.description_hi };
          if (r.description_en) translations.en = { title: r.product_name, message: r.description_en };

          return {
            name: r.product_name,
            mrp: r.mrp || 0,
            tagline: r.tagline || null,
            description: r.description_en || null,
            category: r.category || 'fertilizers',
            dosage: r.dosage || null,
            crops,
            image_url: r.product_image || null,
            icon: 'leaf',
            available_states: states,
            status: r.status || 'active',
            benefits: benefitsList,
            is_trending: r.trending_product || false,
            is_best_seller: r.best_seller || false,
            translations: Object.keys(translations).length > 0 ? translations : null,
          };
        });

        const { error: insertErr } = await supabase.from('products').insert(products);
        if (insertErr) {
          // Mark as failed
          for (const r of batch) {
            await supabase.from('product_import_temp').update({ import_status: 'error', error_message: insertErr.message }).eq('id', r.id);
          }
          failedCount += batch.length;
        } else {
          // Mark as imported
          const ids = batch.map((r: any) => r.id);
          await supabase.from('product_import_temp').update({ import_status: 'imported' }).in('id', ids);
          successCount += batch.length;
        }
      }

      // Count errors
      const { count: errorCount } = await supabase
        .from('product_import_temp')
        .select('*', { count: 'exact', head: true })
        .eq('batch_id', newBatchId)
        .eq('import_status', 'error');

      failedCount += errorCount || 0;

      // Log the import
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('import_logs').insert({
        file_name: fileName,
        total_records: rows.length,
        successful_records: successCount,
        failed_records: failedCount,
        uploaded_by: user?.id || null,
        status: failedCount === 0 ? 'completed' : 'partial',
      });

      setResults({ total: rows.length, success: successCount, failed: failedCount });
      setStep('results');
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      if (failedCount === 0) {
        toast.success(`All ${successCount} products imported successfully!`);
      } else {
        toast.warning(`${successCount} imported, ${failedCount} failed.`);
      }

      // Trigger AI translations for rows missing mr/hi descriptions
      triggerAITranslations(newBatchId);
    } catch (err: any) {
      toast.error('Import failed: ' + err.message);
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerAITranslations = async (bid: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-translate-products', {
        body: { batch_id: bid },
      });
      if (error) console.error('Translation trigger error:', error);
      else if (data?.translated > 0) toast.success(`AI translated ${data.translated} product descriptions.`);
    } catch { /* silent */ }
  };

  const downloadTemplate = () => {
    const template = [
      {
        product_name: 'Example Product',
        mrp: 500,
        tagline: 'Best for crops',
        description_en: 'Detailed description in English',
        description_mr: '',
        description_hi: '',
        benefits: 'Benefit 1; Benefit 2; Benefit 3',
        category: 'fertilizers',
        dosage: '2ml/L',
        recommended_crops: 'Rice, Cotton, Grapes',
        product_image: '',
        available_states: 'Maharashtra, Gujarat',
        status: 'active',
        trending_product: false,
        best_seller: false,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_upload_template.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Upload Products</h1>
          <p className="text-muted-foreground">Import products from an Excel file</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">Upload Excel File</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: .xlsx, .xls, .csv — Max 500 rows, 5MB
                </p>
              </div>

              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />

              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Parsing...</> : <><Upload className="w-5 h-5" /> Select File</>}
              </button>

              <button onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-4">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold">Preview: {fileName}</h2>
                  <p className="text-sm text-muted-foreground">{rows.length} records found</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setStep('upload'); setRows([]); }}
                    className="flex items-center gap-1 px-3 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors">
                    <Trash2 className="w-4 h-4" /> Discard
                  </button>
                  <button onClick={handleConfirmImport} disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Confirm Import
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Name</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Category</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">MRP</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Crops</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">States</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Valid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const error = validateRow(row);
                      return (
                        <tr key={i} className={`border-b border-border/30 ${error ? 'bg-destructive/5' : ''}`}>
                          <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-3 py-2 font-medium">{row.product_name || <span className="text-destructive">—</span>}</td>
                          <td className="px-3 py-2">{row.category}</td>
                          <td className="px-3 py-2">{row.mrp > 0 ? `₹${row.mrp}` : '-'}</td>
                          <td className="px-3 py-2 max-w-[150px] truncate">{row.recommended_crops || '-'}</td>
                          <td className="px-3 py-2 max-w-[150px] truncate">{row.available_states || '-'}</td>
                          <td className="px-3 py-2">{row.status}</td>
                          <td className="px-3 py-2">
                            {error ? (
                              <span className="flex items-center gap-1 text-destructive text-xs" title={error}>
                                <XCircle className="w-4 h-4" /> {error}
                              </span>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-secondary" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card border border-border/50 p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-lg font-semibold">Processing Import...</h2>
            <p className="text-sm text-muted-foreground">Validating and inserting {rows.length} products</p>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
            <div className="flex flex-col items-center gap-6">
              {results.failed === 0 ? (
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-accent" />
                </div>
              )}

              <h2 className="text-xl font-bold">Import Complete</h2>

              <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold">{results.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-xl">
                  <p className="text-2xl font-bold text-secondary">{results.success}</p>
                  <p className="text-xs text-muted-foreground">Success</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-xl">
                  <p className="text-2xl font-bold text-destructive">{results.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onBack}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
                  Back to Products
                </button>
                <button onClick={() => { setStep('upload'); setRows([]); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Upload More
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
