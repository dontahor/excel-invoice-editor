'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Calendar, Hash, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseExcel, generateExcel, ExcelData } from '@/lib/excel';

export default function ExcelEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExcelData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const parsedData = await parseExcel(uploadedFile);
      setFile(uploadedFile);
      setData(parsedData);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Failed to parse Excel file. Please ensure it's a valid .xlsx file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!data) return;

    setIsProcessing(true);
    try {
      const blob = await generateExcel(data.originalWorkbook, {
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        dateRange: data.dateRange,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const newFileName = file ? file.name.replace(/(\d+)/, (match) => String(parseInt(match) + 1)) : 'updated_invoice.xlsx';
      a.download = newFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating file:", error);
      alert("Failed to generate Excel file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-24 flex flex-col items-center justify-center relative">
      <div className="bg-gradient" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <header className="text-center mb-12">
          <motion.div
            className="inline-block p-4 rounded-2xl bg-indigo-500/10 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <FileText className="w-12 h-12 text-indigo-500" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Invoice Editor</h1>
          <p className="text-slate-400 text-lg">Upload your invoice, edit the details, and download the new version instantly.</p>
        </header>

        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="upload-zone glass-card"
            >
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                className="sr-only"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:bg-indigo-500/20 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drop your .xlsx here</h3>
                <p className="text-slate-500">or click to browse files</p>
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card space-y-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="font-medium text-slate-300">{file?.name}</span>
                </div>
                <button
                  onClick={() => setData(null)}
                  className="text-sm text-slate-500 hover:text-white transition-colors"
                >
                  Change File
                </button>
              </div>

              <div className="grid gap-6">
                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Invoice Number
                  </label>
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                    className="input-field"
                    placeholder="e.target.value"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Invoice Date
                  </label>
                  <input
                    type="date"
                    value={data.invoiceDate}
                    onChange={(e) => setData({ ...data, invoiceDate: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Date Range
                  </label>
                  <input
                    type="text"
                    value={data.dateRange}
                    onChange={(e) => setData({ ...data, dateRange: e.target.value })}
                    className="input-field"
                    placeholder="15/12/2025 - 19/12/2025"
                  />
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="btn btn-primary w-full py-4 text-lg"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Save & Download
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="mt-12 text-slate-600 text-sm">
        Built with Next.js & ExcelJS
      </footer>
    </main>
  );
}
