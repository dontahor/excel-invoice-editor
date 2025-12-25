import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

export function FileUpload({ onFileUpload }) {
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    const handleChange = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    return (
        <div className="upload-zone group">
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                id="file-upload"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:bg-indigo-500/20 transition-colors">
                    <Upload className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Drop your invoice here</h3>
                <p className="text-slate-500">or click to browse files</p>
            </label>
        </div>
    );
}
