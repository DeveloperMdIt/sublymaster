import React, { useEffect, useState } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PrinterAnalytics = ({ token }) => {
    // Mock Data for "Learning Curve"
    const data = {
        labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai'],
        datasets: [
            {
                label: 'Durchschnittlicher Offset (mm)',
                data: [-6.5, -5.3, -4.2, -4.1, -4.0], // Stabilizing
                borderColor: '#4f46e5', // Indigo-600
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Varianz (User Meldungen)',
                data: [-7.0, -4.8, -3.9, -4.4, -4.05], // Noise
                borderColor: 'rgba(156, 163, 175, 0.3)', // Gray-400
                borderDash: [5, 5],
                pointStyle: 'crossRot',
                pointRadius: 6,
                showLine: false,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Printer Learning Curve',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                title: { display: true, text: 'Offset (mm)' },
                grid: { borderDash: [2, 4] }
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Drucker-Intelligenz</h2>
                    <p className="text-gray-500">Analyse der Hardware-Abweichungen und Community-Daten</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium border border-gray-200 text-indigo-600 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    Live-Daten aktiv
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-3 -translate-y-2">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Erfolgsquote</p>
                    <p className="text-4xl font-black text-emerald-600 mt-2">94.2%</p>
                    <p className="text-xs text-green-600 mt-2 font-medium">+2.4% diese Woche</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-3 -translate-y-2">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Top Modell</p>
                    <p className="text-3xl font-black text-indigo-600 mt-2">Epson ET-2810</p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">142 aktive Nutzer</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-3 -translate-y-2">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Problem-Modelle</p>
                    <p className="text-4xl font-black text-amber-600 mt-2">4</p>
                    <p className="text-xs text-amber-600 mt-2 font-medium">Hohe Varianz erkannt</p>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Learning Curve: Epson ET-Serie</h3>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Epson ET-2810</option>
                        <option>Sawgrass SG500</option>
                        <option>Canon PIXMA</option>
                    </select>
                </div>
                <div className="h-80 w-full">
                    <Line options={options} data={data} />
                </div>
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm">AI-Empfehlung</h4>
                        <p className="text-indigo-800 text-sm mt-1">Das Modell "Epson ET-Serie" stabilisiert sich bei <strong>-4.2mm</strong>. Der aktuelle Standardwert ist -4.0mm.</p>
                        <button className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 font-bold transition-colors">
                            Standardwert global korrigieren
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Feedback Feed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Live Feedback-Stream</h3>
                <div className="space-y-4">
                    {[
                        { user: 'micha***@gmail.com', model: 'Epson ET-2810', offset: -4.2, status: 'success', time: 'Vor 2 Min' },
                        { user: 'thomas.w***@web.de', model: 'Canon PIXMA', offset: -2.0, status: 'failed', time: 'Vor 15 Min' },
                        { user: 'sabine***@t-online.de', model: 'Sawgrass SG500', offset: 0, status: 'success', time: 'Vor 42 Min' },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{log.model}</p>
                                    <p className="text-xs text-gray-500">{log.user}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-mono font-medium">{log.offset > 0 ? `+${log.offset}` : log.offset}mm</span>
                                <span className="text-xs text-gray-400">{log.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrinterAnalytics;
