import React, { useRef } from 'react';
import { Calendar, Hash, Clock, PoundSterling, Download, CheckCircle2, ArrowRight, RotateCcw, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

// Internal Stepper Component for "Pro" feel
const NumberStepper = ({ value, onChange, step = 0.5, icon: Icon, label }) => {
    const handleIncrement = () => {
        const current = parseFloat(value) || 0;
        onChange((current + step).toString());
    };

    const handleDecrement = () => {
        const current = parseFloat(value) || 0;
        if (current - step >= 0) {
            onChange((current - step).toString());
        }
    };

    return (
        <motion.div
            className="input-group"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        >
            <label className="input-label mb-2">{label}</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1.5 ring-1 ring-transparent focus-within:ring-indigo-500/50 transition-all">

                {/* Decrement */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecrement}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 text-slate-300 transition-colors cursor-pointer touch-manipulation"
                >
                    <Minus className="w-4 h-4" />
                </motion.button>

                {/* Input Area */}
                <div className="flex-1 relative text-center">
                    <Icon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 opacity-50" />
                    <input
                        type="number"
                        step={step}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-transparent border-none text-center text-xl font-bold text-white focus:ring-0 p-0 font-mono focus:outline-none"
                    />
                </div>

                {/* Increment */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncrement}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer touch-manipulation"
                >
                    <Plus className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
};

export function InvoiceForm({ data, onChange, onSave, onCancel, fileName }) {

    const handleSaveAndConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            disableForReducedMotion: true
        });
        onSave();
    };

    // Date picker helper
    const openPicker = (e) => {
        try {
            e.target.showPicker();
        } catch (err) {
            // Fallback for browsers not supporting showPicker
        }
    };

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="glass-card flex flex-col relative pb-32 md:pb-8"
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {/* Header / Meta */}
            <div className="space-y-8">

                {/* File Info Bar */}
                <motion.div
                    variants={item}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded-xl bg-indigo-500/20 shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-200 truncate text-sm md:text-base">{fileName}</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        onClick={onCancel}
                        className="shrink-0 p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Change File"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Section 1: Details */}
                <motion.div variants={item}>
                    <div className="section-label">Invoice Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="input-group">
                            <label className="input-label" htmlFor="invoice-number">Invoice Number</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
                                <motion.input
                                    whileFocus={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    id="invoice-number"
                                    type="number"
                                    value={data.invoiceNumber || ''}
                                    onChange={(e) => onChange('invoiceNumber', e.target.value)}
                                    // Forced padding-left to prevent overlap
                                    className="input-field !pl-12"
                                    placeholder="001"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="invoice-date">Invoice Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none z-10" />
                                <motion.input
                                    whileFocus={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    id="invoice-date"
                                    type="date"
                                    value={data.invoiceDate || ''}
                                    onChange={(e) => onChange('invoiceDate', e.target.value)}
                                    onClick={openPicker}
                                    className="input-field !pl-12 appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Section 2: Period */}
                <motion.div variants={item}>
                    <div className="section-label">Time Period</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="input-label text-xs md:text-sm">Period Start</label>
                            <motion.input
                                whileFocus={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                id="period-start"
                                type="date"
                                value={data.periodStart || ''}
                                onChange={(e) => onChange('periodStart', e.target.value)}
                                onClick={openPicker}
                                className="input-field text-sm md:text-base appearance-none cursor-pointer text-center"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label text-xs md:text-sm">Period End</label>
                            <motion.input
                                whileFocus={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                id="period-end"
                                type="date"
                                value={data.periodEnd || ''}
                                onChange={(e) => onChange('periodEnd', e.target.value)}
                                onClick={openPicker}
                                className="input-field text-sm md:text-base appearance-none cursor-pointer text-center"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Work (Stepper Inputs) */}
                <motion.div variants={item}>
                    <div className="section-label">Work Log</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NumberStepper
                            label="Hours Worked"
                            value={data.hours}
                            onChange={(val) => onChange('hours', val)}
                            step={0.5}
                            icon={Clock}
                        />
                        <NumberStepper
                            label="Hourly Rate (£)"
                            value={data.rate}
                            onChange={(val) => onChange('rate', val)}
                            step={1} // Maybe 1.0 increments for rate?
                            icon={PoundSterling}
                        />
                    </div>
                </motion.div>

                {/* Total Display */}
                <motion.div
                    variants={item}
                    className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/20 text-center"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Earned</div>
                    <div className="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
                        £{(parseFloat(data.hours || 0) * parseFloat(data.rate || 0)).toFixed(2)}
                    </div>
                </motion.div>

            </div>

            {/* Sticky Mobile Action Bar */}
            <motion.div
                variants={item}
                className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent z-20 md:relative md:bg-none md:p-0 md:mt-8"
            >
                <motion.button
                    onClick={handleSaveAndConfetti}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-500/20 transition-all"
                >
                    <Download className="w-5 h-5" />
                    <span>Save & Download</span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
