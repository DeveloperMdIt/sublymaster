import React from 'react';

const OrientationGuide = ({ width, height }) => {
    const isLandscape = width > height;

    return (
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <div className="flex-shrink-0">
                {/* Ein kleines Icon, das ein Blatt Papier zeigt */}
                <div className={`w-10 h-14 border-2 border-gray-400 rounded flex items-center justify-center transition-transform duration-300 ${isLandscape ? 'rotate-90' : ''}`}>
                    <div className="w-6 h-1 bg-gray-300"></div>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700">
                    Drucker-Ausrichtung: <span className="text-indigo-600 font-bold">{isLandscape ? 'Querformat' : 'Hochformat'}</span>
                </p>
                <p className="text-xs text-gray-500">
                    Lege dein Papier so ein, dass die längere Seite {isLandscape ? 'horizontal' : 'vertikal'} liegt.
                </p>
            </div>
        </div>
    );
};

export default OrientationGuide;
