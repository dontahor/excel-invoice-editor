import React, { useState, useEffect } from 'react';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';

import { FileUpload } from './components/FileUpload';
import { InvoiceForm } from './components/InvoiceForm';
import { FileText, Coffee } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [file, setFile] = useState(null);
  const [workbook, setWorkbook] = useState(null); // This will now hold XlsxPopulate workbook
  const [formData, setFormData] = useState(null);

  const handleFileUpload = async (uploadedFile) => {
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const wb = await XlsxPopulate.fromDataAsync(arrayBuffer);

      const ws = wb.sheet(0); // Get first worksheet

      const getVal = (cellAddr) => {
        const cell = ws.cell(cellAddr);
        const val = cell.value();
        return val === undefined || val === null ? '' : val;
      };

      // Helper to safely format date objects or strings to YYYY-MM-DD
      const toDateStr = (val) => {
        if (!val) return '';
        // XlsxPopulate might return dates as numbers (serial) or Date objects
        if (typeof val === 'number') {
          return XlsxPopulate.numberToDate(val).toISOString().split('T')[0];
        }
        if (val instanceof Date) return val.toISOString().split('T')[0];
        return String(val); // Fallback
      };

      const invoiceNumRaw = getVal('E1');
      const currentInvoiceNum = parseInt(invoiceNumRaw, 10) || 0;

      // Calculate defaults
      const nextInvoiceNum = currentInvoiceNum + 1;
      const today = new Date().toISOString().split('T')[0];

      const data = {
        invoiceNumber: nextInvoiceNum,
        invoiceDate: today,
        periodStart: toDateStr(getVal('E3')),
        periodEnd: toDateStr(getVal('E4')),
        hours: getVal('C15'),
        rate: getVal('D15'),
      };

      setFormData(data);
      setWorkbook(wb);
      setFile(uploadedFile);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please ensure it is a valid .xlsx file.");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!workbook || !formData) return;

    const ws = workbook.sheet(0);

    // Update cells 
    ws.cell('E1').value(parseInt(formData.invoiceNumber));
    ws.cell('E2').value(new Date(formData.invoiceDate)).style("numberFormat", "dd/mm/yyyy");
    ws.cell('E3').value(new Date(formData.periodStart)).style("numberFormat", "dd/mm/yyyy");
    ws.cell('E4').value(new Date(formData.periodEnd)).style("numberFormat", "dd/mm/yyyy");

    const hours = parseFloat(formData.hours);
    const rate = parseFloat(formData.rate);
    const total = hours * rate;

    ws.cell('C15').value(hours);
    ws.cell('D15').value(rate);
    ws.cell('E15').value(total);

    // Subtotal and Total
    ws.cell('E26').value(total);
    ws.cell('E27').value(total);


    // Update Line Item Date (A15) to match Period End
    ws.cell('A15').value(new Date(formData.periodEnd)).style("numberFormat", "dd/mm/yyyy");

    // Update Line Item Description (B15)
    // We need a helper to format date for text insertion
    const formatDateForText = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Check if dates are valid before formatting
    const startStr = formData.periodStart ? formatDateForText(formData.periodStart) : '';
    const endStr = formData.periodEnd ? formatDateForText(formData.periodEnd) : '';
    const desc = `Hours worked (${startStr}–${endStr})`;

    ws.cell('B15').value(desc);


    // Generate output buffer
    // XlsxPopulate outputAsync returns a Uint8Array or Blob/Buffer depending on type. 
    // Browser default is Uint8Array/Blob-like.
    const buffer = await workbook.outputAsync();

    // Trigger download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Smart Filename Logic
    let downloadName = file?.name || "edited_invoice.xlsx";
    if (file?.name) {
      const match = file.name.match(/^(.*?)(\d+)(\.xlsx)$/i);
      if (match) {
        const prefix = match[1];
        const ext = match[3];
        downloadName = `${prefix}${formData.invoiceNumber}${ext}`;
      }
    }

    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-8 md:p-24 flex flex-col items-center justify-center relative bg-transparent">
      <div className="bg-gradient" />

      <div className="max-w-2xl w-full">
        <header className="text-center mb-12">
          <div className="inline-block p-4 rounded-2xl bg-indigo-500/10 mb-6 border border-indigo-500/20 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
            <FileText className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-sm">Percy's Invoice Editor</h1>
          <p className="text-slate-400 text-lg">Upload your invoice, edit the details, and download the new version instantly.</p>
        </header>

        <AnimatePresence mode="wait">
          {!formData ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card"
            >
              <FileUpload onFileUpload={handleFileUpload} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InvoiceForm
                data={formData}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={() => setFormData(null)}
                fileName={file?.name}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-12 text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
        <span>Powered by coffee</span>
        <Coffee className="w-4 h-4 text-amber-600" />
      </footer>
    </main>
  );
}

export default App;
