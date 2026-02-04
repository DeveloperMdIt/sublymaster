import React, { useState, useEffect } from 'react';

export default function TemplateManagement() {
    const [standardTemplates, setStandardTemplates] = useState([]);
    const [customAnalysis, setCustomAnalysis] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [newTemplate, setNewTemplate] = useState({ name: '', widthMm: '', heightMm: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStandardTemplates(data.standardTemplates || []);
            setCustomAnalysis(data.customAnalysis || []);
        } catch (err) {
            console.error('Failed to load templates:', err);
        }
    };

    const addTemplate = async () => {
        if (!newTemplate.name || !newTemplate.widthMm || !newTemplate.heightMm) {
            setMessage('Bitte alle Felder ausfüllen');
            return;
        }

        const token = localStorage.getItem('token');
        await fetch('/api/admin/templates', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: newTemplate.name,
                width: parseInt(newTemplate.widthMm) * 4,  // mm to px
                height: parseInt(newTemplate.heightMm) * 4
            })
        });

        setShowAddModal(false);
        setNewTemplate({ name: '', widthMm: '', heightMm: '' });
        setMessage('Template erstellt!');
        loadTemplates();
    };

    const updateTemplate = async () => {
        const token = localStorage.getItem('token');
        await fetch(`/api/admin/templates/${editingTemplate.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: editingTemplate.name,
                width: editingTemplate.width,
                height: editingTemplate.height
            })
        });

        setEditingTemplate(null);
        setMessage('Template aktualisiert!');
        loadTemplates();
    };

    const deleteTemplate = async (id) => {
        if (!confirm('Template wirklich löschen?')) return;

        const token = localStorage.getItem('token');
        await fetch(`/api/admin/templates/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        setMessage('Template gelöscht!');
        loadTemplates();
    };

    const promoteToStandard = async (width, height, suggestedName) => {
        const name = prompt('Name für Standard-Template:', suggestedName || `Template ${width / 4}x${height / 4}mm`);
        if (!name) return;

        const token = localStorage.getItem('token');
        await fetch('/api/admin/templates/promote', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ width, height, name })
        });

        setMessage('Template zu Standard befördert!');
        loadTemplates();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">📐 Template-Verwaltung</h2>

            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {message}
                </div>
            )}

            {/* Standard-Templates */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Standard-Templates</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        + Neues Template
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Größe (mm)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pixel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {standardTemplates.map(t => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4">{t.name}</td>
                                    <td className="px-6 py-4">{t.width / 4}x{t.height / 4}mm</td>
                                    <td className="px-6 py-4 text-gray-500">{t.width}x{t.height}px</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setEditingTemplate(t)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            ✏️ Bearbeiten
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(t.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            🗑️ Löschen
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Custom-Template-Analyse */}
            <section>
                <h3 className="text-xl font-semibold mb-4">📊 Beliebte Custom-Größen</h3>
                <p className="text-gray-600 mb-4">Welche Größen nutzen Ihre Kunden am häufigsten?</p>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Größe (mm)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pixel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anzahl Nutzer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anzahl Templates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beispiel-Namen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customAnalysis.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold">{item.width / 4}x{item.height / 4}mm</td>
                                    <td className="px-6 py-4 text-gray-500">{item.width}x{item.height}px</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            👥 {item.user_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{item.template_count}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {item.names?.slice(0, 3).join(', ')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => promoteToStandard(item.width, item.height, item.names?.[0])}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                                        >
                                            ⭐ Zu Standard hinzufügen
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {customAnalysis.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Noch keine Custom-Templates von Nutzern erstellt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Add Template Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Neues Standard-Template</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="z.B. Große Tasse"
                                    className="w-full border rounded px-3 py-2"
                                    value={newTemplate.name}
                                    onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Breite (mm)</label>
                                    <input
                                        type="number"
                                        placeholder="200"
                                        className="w-full border rounded px-3 py-2"
                                        value={newTemplate.widthMm}
                                        onChange={e => setNewTemplate({ ...newTemplate, widthMm: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Höhe (mm)</label>
                                    <input
                                        type="number"
                                        placeholder="95"
                                        className="w-full border rounded px-3 py-2"
                                        value={newTemplate.heightMm}
                                        onChange={e => setNewTemplate({ ...newTemplate, heightMm: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={addTemplate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Erstellen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Template Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Template bearbeiten</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={editingTemplate.name}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Breite (mm)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={editingTemplate.width / 4}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, width: parseInt(e.target.value) * 4 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Höhe (mm)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={editingTemplate.height / 4}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, height: parseInt(e.target.value) * 4 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setEditingTemplate(null)}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={updateTemplate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
