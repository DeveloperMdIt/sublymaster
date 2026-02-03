
import React from 'react';

const PrintSettingsHint = () => (
    <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-lg my-4 animate-pulse">
        <h4 className="font-bold text-amber-800 flex items-center gap-2">
            ⚠️ WICHTIG: Druckeinstellungen prüfen
        </h4>
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
            <div className="flex flex-col border-r border-amber-200 pr-2">
                <span className="font-bold text-amber-900">1. Ränder:</span>
                <span className="text-red-600 font-black underline italic">Muss auf "KEINE"</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-amber-900">2. Skalierung:</span>
                <span className="text-red-600 font-black underline italic">Muss auf "100" (Standard)</span>
            </div>
        </div>
        <div className="mt-2 text-xs text-amber-700">
            *Papierformat: Bitte <strong>95x200mm</strong> (Benutzerdefiniert) wählen, falls verfügbar.
        </div>
    </div>
);

export default PrintSettingsHint;
