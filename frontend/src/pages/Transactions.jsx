import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShoppingBag, Clock } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function Transactions() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.transactions, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data);
                }
            } catch (err) {
                console.error("Failed to fetch transactions", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchTransactions();
    }, [token]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-10 max-w-4xl">
                    <button onClick={() => navigate('/profile')} className="flex items-center text-gray-400 hover:text-indigo-600 mb-6 transition-all group font-medium">
                        <ArrowLeft size={20} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        Zurück zum Profil
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Transaktionen</h1>
                    <p className="text-gray-500 mt-2">Ihre Guthaben-Buchungen und Plan-Änderungen auf einen Blick.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 font-medium">Lade Transaktionen...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">
                            <Clock size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg">Noch keine Transaktionen vorhanden.</p>
                            <button onClick={() => navigate('/plans')} className="mt-6 text-indigo-600 font-bold hover:underline">Jetzt Credits buchen</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Datum</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Typ</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Beschreibung</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Menge</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6 text-sm text-gray-600 font-medium">{formatDate(t.timestamp)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${t.type === 'credits_buy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    t.type === 'plan_change' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                                        'bg-gray-50 text-gray-700 border border-gray-100'
                                                    }`}>
                                                    {t.type === 'credits_buy' ? 'Guthaben' : t.type === 'plan_change' ? 'Abo' : t.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-900 font-bold">{t.description}</td>
                                            <td className="px-8 py-6 text-sm text-right font-black text-gray-900">
                                                {t.credits > 0 ? `+${t.credits} Credits` : t.amount > 0 ? `${t.amount.toFixed(2)}€` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
