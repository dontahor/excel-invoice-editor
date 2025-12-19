'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Download, FileText, Calendar, Hash, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { parseExcel, generateExcel, ExcelData } from '@/lib/excel';

export default function ExcelEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExcelData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Date Range State
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  // Update local date range state when data changes
  useEffect(() => {
    if (data?.dateRange) {
      const parts = data.dateRange.split(' - ');
      if (parts.length === 2) {
        const parseDate = (d: string) => {
          const [day, month, year] = d.split('/').map(Number);
          // Check if valid date
          if (!day || !month || !year) return null;
          return new Date(year, month - 1, day);
        };
        setDateRange([parseDate(parts[0]), parseDate(parts[1])]);
      }
    }
  }, [data?.dateRange]);

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

  // Helper to safely parse date string to Date object for single date
  const getDateObject = (dateStr: string) => {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Helper to format date for display/storage
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <main className="container">
      <div className="bg-gradient" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <header className="text-center mb-12">
          <motion.div
            className="inline-block p-4 rounded-2xl bg-indigo-500/10 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <FileText className="w-12 h-12 text-indigo-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Invoice Editor</h1>
          <p className="text-slate-400 text-lg">Upload, edit, and download instantly.</p>
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
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
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
              className="glass-card space-y-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setData(null)}
                className="absolute -top-4 -right-4 p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full border border-red-500/20 hover:border-red-500 transition-all shadow-lg backdrop-blur-md z-10"
                title="Close and upload new file"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-indigo-500/20 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Editing File</span>
                    <span className="font-medium text-slate-200 truncate text-lg">{file?.name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="input-group relative z-30">
                  <label className="input-label flex items-center gap-2">
                    <Hash className="w-4 h-4 text-indigo-400" /> Invoice Number
                  </label>
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 38"
                  />
                </div>

                <div className="input-group relative z-20">
                  <label className="input-label flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Invoice Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={getDateObject(data.invoiceDate)}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setData({ ...data, invoiceDate: date.toISOString().split('T')[0] });
                        }
                      }}
                      dateFormat="yyyy-MM-dd"
                      className="input-field w-full"
                      wrapperClassName="w-full"
                      showPopperArrow={false}
                    />
                  </div>
                </div>

                <div className="input-group relative z-10">
                  <label className="input-label flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-indigo-400" /> Date Range
                  </label>
                  <div className="relative">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                        const [start, end] = update;
                        if (start && end) {
                          setData({
                            ...data,
                            dateRange: `${formatDate(start)} - ${formatDate(end)}`
                          });
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      className="input-field w-full"
                      wrapperClassName="w-full"
                      placeholderText="Select start and end date"
                      showPopperArrow={false}
                      isClearable={true}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="btn btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-indigo-500/20 relative z-0"
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

      <footer className="mt-12 text-center text-slate-600 text-sm pb-8">
        <p>Built with Next.js & ExcelJS</p>
      </footer>
    </main>
  );
}
