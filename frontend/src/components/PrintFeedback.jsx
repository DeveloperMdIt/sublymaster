
import React from 'react';

const PrintFeedback = ({ printerModel, onAdjustmentNeeded, onSuccess }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
            <div className="w-80 bg-white shadow-2xl rounded-2xl p-4 border border-blue-100 animate-bounce-in font-sans pointer-events-auto">
                <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span>🖨️</span> Passt das Ergebnis?
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                    War das Motiv auf deinem <strong>{printerModel || 'Drucker'}</strong> exakt dort, wo es sein sollte?
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={onSuccess}
                        className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg hover:bg-green-600 transition font-bold shadow-sm"
                    >
                        Perfekt! ✅
                    </button>
                    <button
                        onClick={onAdjustmentNeeded}
                        className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 rounded-lg hover:bg-gray-200 transition border border-gray-200 font-medium"
                    >
                        Etwas verschoben 🔧
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintFeedback;
