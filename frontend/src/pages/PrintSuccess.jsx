
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, History, ArrowRight } from 'lucide-react';

const PrintSuccess = () => {
    const [searchParams] = useSearchParams();
    const credits = searchParams.get('credits') || '0';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Druckauftrag erfolgreich!</h1>
                <p className="text-gray-600 mb-8">
                    Dein Design wurde erfolgreich generiert und an den Drucker gesendet.
                </p>

                {/* Credit Display */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                    <p className="text-xs text-indigo-600 uppercase tracking-widest font-bold mb-1 relative z-10">Verbleibende Credits</p>
                    <p className="text-5xl font-black text-indigo-900 relative z-10">{credits}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        to="/editor"
                        className="bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
                    >
                        <span>Zurück zum Editor</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        to="/dashboard"
                        className="bg-white border text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition border-gray-200 flex items-center justify-center gap-2"
                    >
                        <History size={18} />
                        <span>Druck-Historie ansehen</span>
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-gray-400 text-xs">
                Probleme beim Druck? <span className="underline cursor-pointer hover:text-gray-600">Support kontaktieren</span>
            </p>
        </div>
    );
};

export default PrintSuccess;
