import React from 'react';

const PrintGuide = ({ width, height }) => {
    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded shadow-sm">
            <h4 className="font-bold text-blue-800 flex items-center mb-2">
                💡 Profi-Einstellungen für perfekte Ergebnisse:
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-center">
                    <span className="bg-blue-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs font-bold shrink-0">1</span>
                    <span><strong>Ränder:</strong> "Keine" oder "0" wählen.</span>
                </li>
                <li className="flex items-center">
                    <span className="bg-blue-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs font-bold shrink-0">2</span>
                    <span><strong>Skalierung:</strong> "Standard" oder "100%".</span>
                </li>
                <li className="flex items-center">
                    <span className="bg-blue-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs font-bold shrink-0">3</span>
                    <span><strong>Format:</strong> Prüfen, ob <strong>{width}x{height}mm</strong> erkannt wurde.</span>
                </li>
            </ul>
            <p className="mt-3 text-xs text-blue-600 italic">
                Falls der Drucker trotzdem A4 anzeigt, wähle kurz dein gespeichertes Profil am PC aus oder stelle das Papierformat auf "Benutzerdefiniert".
            </p>
        </div>
    );
};

export default PrintGuide;
