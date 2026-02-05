
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileImage, Layers } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const PrintHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.history, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchHistory();
    }, [token]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 font-primary">Druck-Historie</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Lade Daten...</div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Layers size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Noch keine Druckaufträge ausgeführt.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motiv</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        {formatDate(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <FileImage size={16} className="text-indigo-500" />
                                            {log.file_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {log.format}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PrintHistory;
