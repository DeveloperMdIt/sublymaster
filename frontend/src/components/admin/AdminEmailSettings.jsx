import { useState, useEffect } from 'react';
import { Mail, Save, Send, Eye, Edit3, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Modal from '../Modal';
import { API_ENDPOINTS } from '../../config/api';

const AdminEmailSettings = ({ token, showNotify }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.admin.emailTemplates, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
                if (data.length > 0 && !selectedTemplate) {
                    setSelectedTemplate(data[0]);
                }
            }
        } catch (err) {
            showNotify('Fehler beim Laden der Vorlagen', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsSaving(true);
        try {
            const res = await fetch(API_ENDPOINTS.admin.emailTemplateByType(selectedTemplate.type), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: selectedTemplate.subject,
                    body: selectedTemplate.body,
                    enabled: selectedTemplate.enabled
                })
            });
            if (res.ok) {
                showNotify('Vorlage gespeichert');
                fetchTemplates();
            } else {
                showNotify('Fehler beim Speichern', 'error');
            }
        } catch (err) {
            showNotify('Serverfehler beim Speichern', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!selectedTemplate || !testEmail) return;
        setIsTesting(true);
        try {
            const res = await fetch(API_ENDPOINTS.testEmail, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: selectedTemplate.type,
                    testEmail: testEmail
                })
            });
            if (res.ok) {
                showNotify('Test-Email gesendet an ' + testEmail);
            } else {
                showNotify('Fehler beim Senden der Test-Email', 'error');
            }
        } catch (err) {
            showNotify('Serverfehler beim Senden', 'error');
        } finally {
            setIsTesting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Lade Email-Einstellungen...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar: Template List */}
            <div className="lg:col-span-1 border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col h-fit">
                <div className="bg-gray-50 p-4 border-b">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Mail size={18} className="text-indigo-600" />
                        System-Emails
                    </h3>
                </div>
                <div className="divide-y">
                    {templates.map(t => (
                        <button
                            key={t.type}
                            onClick={() => setSelectedTemplate(t)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col gap-1 ${selectedTemplate?.type === t.type ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                        >
                            <span className="font-bold text-sm text-gray-900">{t.name}</span>
                            <span className="text-xs text-gray-500 truncate">{t.subject}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${t.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <span className="text-[10px] uppercase font-bold text-gray-400">{t.enabled ? 'Aktiv' : 'Inaktiv'}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: Editor */}
            <div className="lg:col-span-2 space-y-6">
                {selectedTemplate ? (
                    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-indigo-100">
                        <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-indigo-900">{selectedTemplate.name}</h3>
                                <p className="text-xs text-indigo-600/70">Typ: {selectedTemplate.type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">Aktiviert</span>
                                <button
                                    onClick={() => setSelectedTemplate({ ...selectedTemplate, enabled: !selectedTemplate.enabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedTemplate.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedTemplate.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">BetreffZeile</label>
                                <input
                                    type="text"
                                    value={selectedTemplate.subject}
                                    onChange={e => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email-Inhalt</label>
                                <textarea
                                    value={selectedTemplate.body}
                                    onChange={e => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                                    rows={12}
                                    className="w-full rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono leading-relaxed"
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase py-1 px-2 bg-gray-100 rounded">Platzhalter:</span>
                                    {['{{name}}', '{{email}}', '{{verificationLink}}', '{{credits}}'].map(p => (
                                        <code key={p} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 cursor-help" title="Wird automatisch ersetzt">
                                            {p}
                                        </code>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                                >
                                    {isSaving ? 'Speichert...' : <><Save size={18} /> Änderungen speichern</>}
                                </button>

                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Test-Email an..."
                                        value={testEmail}
                                        onChange={e => setTestEmail(e.target.value)}
                                        className="flex-1 rounded-xl border-gray-200 text-sm"
                                    />
                                    <button
                                        onClick={handleSendTest}
                                        disabled={isTesting || !testEmail}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${isTesting || !testEmail ? 'bg-gray-100 text-gray-400' : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Send size={16} />
                                        {isTesting ? '' : 'Test'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Professional Note */}
                        <div className="bg-amber-50 p-4 border-t border-amber-100 flex gap-3">
                            <Info size={18} className="text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Pro-Tipp:</strong> Verwende Platzhalter wie <code>{'{{name}}'}</code>, um die Emails persönlicher zu gestalten. Die Änderungen werden sofort nach dem Speichern für alle neuen System-Aktionen wirksam.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed rounded-2xl opacity-50">
                        <Mail size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-center">Wähle eine Vorlage aus der Liste aus,<br />um sie zu bearbeiten.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEmailSettings;
