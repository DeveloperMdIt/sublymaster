
import React, { useState } from 'react';

export default function CalibrationMode({ onSaveOffset, currentOffset }) {
    const [detectedValue, setDetectedValue] = useState(0);

    const printTestSheet = () => {
        const win = window.open('', '_blank');
        win.document.write(`
          <html>
            <head>
            <style>
                @media print {
                    @page { 
                        size: 95mm 200mm; 
                        margin: 0 !important; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                    }
                    .ruler {
                        position: absolute;
                        /* Artificial negative margin to trick printer gripper */
                        top: -15mm; 
                        width: 95mm;
                        height: 200mm;
                        background: repeating-linear-gradient(
                            to bottom,
                            #000,
                            #000 0.5mm,
                            transparent 0.5mm,
                            transparent 5mm
                        );
                    }
                    .label { position: absolute; left: 10mm; font-size: 10px; border-bottom: 1px solid #ccc; width: 100%; }
                }
            </style>
            </head>
            <body>
              <div class="ruler">
                ${[...Array(41)].map((_, i) => `<div class="label" style="top:${i * 5}mm">${i * 5}mm</div>`).join('')}
              </div>
            </body>
          </html>
        `);
        win.document.close();

        setTimeout(() => {
            win.focus();
            win.print();
            win.close();
        }, 500);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-indigo-500 max-w-lg mx-auto m-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🖨️</span> Drucker-Präzision kalibrieren
            </h3>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <p className="text-sm text-blue-800 mb-2">
                    <strong>Warum kalibrieren?</strong> Jeder Drucker zieht Papier anders ein. Sublymaster korrigiert diesen Hardware-Versatz automatisch für dich.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-600 shrink-0">1</div>
                    <div>
                        <p className="font-medium text-gray-800">Testblatt drucken</p>
                        <p className="text-sm text-gray-500 mb-2">Lege ein 95mm Testblatt ein.</p>
                        <button
                            onClick={printTestSheet}
                            className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors border border-indigo-200"
                        >
                            Testblatt drucken
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-600 shrink-0">2</div>
                    <div>
                        <p className="font-medium text-gray-800">Ablesen & Eintragen</p>
                        <p className="text-sm text-gray-500 mb-2">Schau auf das Papier: Welche Millimeter-Markierung ist die <strong>erste</strong>, die ganz oben (am Einzug) zu sehen ist?</p>

                        <div className="flex items-center gap-4 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={detectedValue}
                                    onChange={(e) => setDetectedValue(e.target.value)}
                                    className="w-24 p-2 text-center border-2 border-indigo-100 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 font-bold text-xl outline-none"
                                    step="0.5"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">mm</span>
                            </div>
                            <button
                                onClick={() => onSaveOffset(detectedValue)}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                Offset speichern
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-gray-400 italic">
                            *Dieser Wert verschiebt den Druck nach unten (Y-Achse).
                            {currentOffset !== undefined && <span className="block mt-1 font-semibold text-green-600">Aktuell gespeichert: {currentOffset}mm</span>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
