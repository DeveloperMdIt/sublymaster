import React from 'react';

export const Logo = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 250 100"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 'auto', width: '100%' }}
        >
            <defs>
                <linearGradient id="sublyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Das Icon (Tasse & Sonne) */}
            <g transform="translate(100, 5)">
                <path
                    d="M5,10 h35 a5,5 0 0 1 5,5 v25 a15,15 0 0 1 -15,15 h-10 a15,15 0 0 1 -15,-15 v-25 a5,5 0 0 1 5,-5"
                    fill="url(#sublyGrad)"
                />
                <text x="12" y="42" fontFamily="sans-serif" fontWeight="bold" fontSize="28" fill="white">S</text>
                <path d="M48,15 l8,-5 M55,25 l10,0 M52,38 l8,8" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Text-Teil */}
            <text x="125" y="75" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="30" fill="currentColor">
                SublyMaster.de
            </text>
            <text x="125" y="92" textAnchor="middle" fontFamily="sans-serif" fontSize="11" letterSpacing="1" fill="currentColor" opacity="0.7">
                DEIN DESIGN. PERFEKT GEPRESST.
            </text>
        </svg>
    );
};
