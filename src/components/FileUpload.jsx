import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FileUpload({ onFileUpload }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleChange = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    return (
        <motion.div
            className="upload-zone group relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isDragging ? { scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.5)', backgroundColor: 'rgba(99, 102, 241, 0.1)' } : { scale: 1, borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'transparent' }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                id="file-upload"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full relative z-10"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <motion.div
                    className="p-6 rounded-full bg-white/5 mb-6 group-hover:bg-indigo-500/20 transition-colors"
                    animate={isDragging ? { scale: 1.2, rotate: 180 } : { scale: 1, rotate: 0 }}
                >
                    <Upload className="w-10 h-10 text-slate-400" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-white">Drop your invoice here</h3>
                <p className="text-slate-500">or click to browse files</p>
            </label>

            {/* Background Pulse Effect */}
            {isDragging && (
                <motion.div
                    layoutId="drag-pulse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-indigo-500/10 z-0"
                />
            )}
        </motion.div>
    );
}
