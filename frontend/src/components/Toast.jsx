import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const styles = {
        success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
        error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <AlertCircle className="w-5 h-5 text-red-500" /> },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info className="w-5 h-5 text-blue-500" /> }
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-right-10 ${style.bg} ${style.border}`}>
            {style.icon}
            <p className={`text-sm font-semibold ${style.text}`}>{message}</p>
            <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
