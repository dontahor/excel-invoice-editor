import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { FileUpload } from './components/FileUpload';
import { InvoiceForm } from './components/InvoiceForm';
import { FileText, Coffee } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [file, setFile] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleFileUpload = async (uploadedFile) => {
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(arrayBuffer);

      const ws = wb.worksheets[0]; // Get first worksheet

      const getVal = (cellAddr) => {
        const cell = ws.getCell(cellAddr);
        // Handle rich text or objects if necessary, though usually .value is fine for simple reads
        return cell.value;
      };

      // Helper to safely format date objects or strings to YYYY-MM-DD
      const toDateStr = (val) => {
        if (!val) return '';
        if (val instanceof Date) return val.toISOString().split('T')[0];
        return String(val); // Fallback
      };

      const currentInvoiceNum = parseInt(getVal('E1'), 10) || 0;

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
      setWorkbook(wb); // Store the ExcelJS workbook which preserves styles
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

    const ws = workbook.worksheets[0];

    // Update cells (preserving formatting)
    ws.getCell('E1').value = parseInt(formData.invoiceNumber);
    ws.getCell('E2').value = new Date(formData.invoiceDate);
    ws.getCell('E3').value = new Date(formData.periodStart);
    ws.getCell('E4').value = new Date(formData.periodEnd);

    const hours = parseFloat(formData.hours);
    const rate = parseFloat(formData.rate);
    const total = hours * rate;

    ws.getCell('C15').value = hours;
    ws.getCell('D15').value = rate;
    ws.getCell('E15').value = total;

    // Fix for "Cannot read properties of null (reading 'theme')" error
    // ExcelJS sometimes fails to write tables if the internal model is incomplete after a load.
    // The previous iteration approach crashed because accessing table properties (like .theme) threw errors.
    // The robust fix for browser environments is to simply clear the table definitions.
    // The visual styling (bold, colors, borders) persists as cell styles, so the output looks correct.
    ws.tables = {};


    // NUCLEAR OPTION: Remove detailed table definitions to ensure save works.
    // The data and cell formatting (bold, colors) are stored in cell styles, not just table defs.
    ws.tables = {};

    // Update Line Item Date (A15) to match Period End
    ws.getCell('A15').value = new Date(formData.periodEnd);

    // Update Line Item Description (B15) to match Period Start - Period End
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const desc = `Hours worked (${formatDate(formData.periodStart)}–${formatDate(formData.periodEnd)})`;
    ws.getCell('B15').value = desc;

    // Update Subtotal and Total fields (Moved to end to ensure they aren't affected by table logical clearing)
    ws.getCell('E26').value = total;
    ws.getCell('E27').value = total;

    // Generate output buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Trigger download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Smart Filename Logic: wk_38.xlsx -> wk_39.xlsx
    let downloadName = file?.name || "edited_invoice.xlsx";
    if (file?.name) {
      // Regex to find "Prefix" + "Number" + ".xlsx"
      // e.g., "wk_" + "38" + ".xlsx"
      const match = file.name.match(/^(.*?)(\d+)(\.xlsx)$/i);
      if (match) {
        const prefix = match[1];
        // match[2] is the old number, ignoring it
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
