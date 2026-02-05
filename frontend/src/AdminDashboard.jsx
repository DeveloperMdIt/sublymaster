import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, CreditCard, Settings, FileText, CheckCircle, AlertCircle, LogOut, X, Mail } from 'lucide-react';
import SMModal from './components/Modal';
import Toast from './components/Toast';
import { API_ENDPOINTS } from './config/api';
import AdminLayout from './components/admin/AdminLayout';
import PrinterAnalytics from './components/admin/PrinterAnalytics';
import TemplateManagement from './components/admin/TemplateManagement';
import AdminEmailSettings from './components/admin/AdminEmailSettings';

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    // States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [plans, setPlans] = useState([]);
    const [notification, setNotification] = useState(null);

    // Settings State
    const [settings, setSettings] = useState({
        stripePublicKey: '',
        stripeSecretKey: '',
        stripeSandboxPublicKey: '',
        stripeSandboxSecretKey: '',
        stripeLiveMode: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Editing States (Fixing the crash)
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ role: 'user', plan_id: 1, account_status: 'active' });

    // Plan Editing States
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', price: '', type: 'subscription', credits: 0, is_active: 1 });
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    // UI Confirmation States
    const [confirmDelete, setConfirmDelete] = useState(null);

    const showNotify = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // Initial Load
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            // If not admin or not logged in, stop loading so we don't hang
            setLoading(false);
            return;
        }

        if (token) {
            setLoading(true);
            Promise.all([
                fetchWithAuth(API_ENDPOINTS.admin.users),
                fetchWithAuth(API_ENDPOINTS.admin.stats),
                fetchWithAuth(API_ENDPOINTS.admin.settings),
                fetchWithAuth(API_ENDPOINTS.admin.plans)
            ])
                .then(async ([usersRes, statsRes, settingsRes, plansRes]) => {
                    // If any request failed due to auth, logout handles it, and we get null
                    if (!usersRes || !statsRes || !settingsRes || !plansRes) return;

                    const usersData = await usersRes.json();
                    const statsData = await statsRes.json();
                    const settingsData = await settingsRes.json();
                    const plansData = await plansRes.json();

                    if (usersRes.ok) setUsers(usersData);
                    if (statsRes.ok) setStats(statsData);
                    if (settingsRes.ok) setSettings(prev => ({ ...prev, ...settingsData }));
                    if (plansRes.ok) setPlans(plansData);
                })
                .catch(err => {
                    console.error(err);
                    showNotify('Fehler beim Laden der Daten', 'error');
                })
                .finally(() => setLoading(false));
        } else {
            console.warn('Admin logged in but no token found. Forcing logout to clear session.');
            logout();
        }
    }, [user, token]);

    // --- Handlers ---

    // Authenticated Fetch Helper
    const fetchWithAuth = async (url, options = {}) => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const res = await fetch(url, { ...options, headers });
            if (res.status === 401 || res.status === 403) {
                showNotify('Sitzung abgelaufen.', 'error');
                logout();
                return null;
            }
            return res;
        } catch (err) {
            throw err;
        }
    };

    // --- Handlers ---

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.admin.userById(editingUser.id), {
                method: 'PUT',
                body: JSON.stringify(editForm)
            });
            if (!res) return; // Logout happened

            if (res.ok) {
                showNotify('Benutzer aktualisiert', 'success');
                setEditingUser(null);
                // Refresh list
                const refresh = await fetchWithAuth(API_ENDPOINTS.admin.users);
                if (refresh && refresh.ok) setUsers(await refresh.json());
            } else {
                showNotify('Fehler beim Aktualisieren', 'error');
            }
        } catch (err) {
            showNotify('Netzwerkfehler', 'error');
        }
    };


    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.admin.settings, {
                method: 'POST',
                body: JSON.stringify(settings)
            });
            if (!res) return;

            if (res.ok) showNotify('Einstellungen gespeichert', 'success');
            else showNotify('Fehler beim Speichern', 'error');
        } catch (err) {
            showNotify('Netzwerkfehler', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestStripe = async () => {
        setIsTesting(true);
        try {
            const secretKey = settings.stripeLiveMode ? settings.stripeSecretKey : settings.stripeSandboxSecretKey;
            const res = await fetchWithAuth(API_ENDPOINTS.admin.testStripe, {
                method: 'POST',
                body: JSON.stringify({ stripeSecretKey: secretKey })
            });
            if (!res) return;

            const data = await res.json();
            if (data.success) showNotify('Stripe Verbindung erfolgreich!', 'success');
            else showNotify('Verbindung fehlgeschlagen: ' + data.error, 'error');
        } catch (err) {
            showNotify('Fehler beim Testen', 'error');
        } finally {
            setIsTesting(false);
        }
    };

    // Plan Handlers
    const openPlanModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setPlanForm({ name: plan.name, price: plan.price, type: plan.type, credits: plan.credits, is_active: plan.is_active });
        } else {
            setEditingPlan(null);
            setPlanForm({ name: '', price: '', type: 'subscription', credits: 0, is_active: 1 });
        }
        setIsPlanModalOpen(true);
    };

    const handleSavePlan = async () => {
        console.log("Saving Plan...", planForm);
        const url = editingPlan ? API_ENDPOINTS.admin.planById(editingPlan.id) : API_ENDPOINTS.admin.plans;
        const method = editingPlan ? 'PUT' : 'POST';

        // Ensure numbers
        const payload = {
            ...planForm,
            price: parseFloat(planForm.price) || 0,
            credits: parseInt(planForm.credits) || 0,
            is_active: planForm.is_active ? 1 : 0
        };

        try {
            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(payload)
            });
            if (!res) return;

            console.log("Save response status:", res.status);

            if (res.ok) {
                showNotify('Plan gespeichert', 'success');
                setIsPlanModalOpen(false);
                const refresh = await fetchWithAuth(API_ENDPOINTS.admin.plans);
                if (refresh && refresh.ok) setPlans(await refresh.json());
            } else {
                const errData = await res.json();
                console.error("Save failed:", errData);
                showNotify('Fehler beim Speichern: ' + (errData.error || 'Unbekannt'), 'error');
            }
        } catch (e) {
            console.error("Save Network Error:", e);
            showNotify('Netzwerkfehler', 'error');
        }
    };

    const togglePlanStatus = async (plan) => {
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.admin.planById(plan.id), {
                method: 'PUT',
                body: JSON.stringify({ ...plan, is_active: plan.is_active ? 0 : 1 })
            });
            if (!res) return;

            setPlans(plans.map(p => p.id === plan.id ? { ...p, is_active: p.is_active ? 0 : 1 } : p));
        } catch (e) { showNotify('Fehler', 'error'); }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600 font-bold">Laden...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Dashboard Übersicht</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                                <h3 className="text-gray-500 text-xs uppercase font-semibold">Benutzer</h3>
                                <p className="text-2xl font-bold mt-1">{stats?.totalUsers || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                                <h3 className="text-gray-500 text-xs uppercase font-semibold">Pro User</h3>
                                <p className="text-2xl font-bold mt-1">{stats?.proUsers || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                                <h3 className="text-gray-500 text-xs uppercase font-semibold">Umsatz (Est.)</h3>
                                <p className="text-2xl font-bold mt-1">{(stats?.proUsers || 0) * 9.99} €</p>
                            </div>
                        </div>
                        {/* Recent Activity */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200"><h3 className="font-medium">Letzte Aktivitäten</h3></div>
                            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                                {stats?.recentActivity?.map(act => (
                                    <li key={act.id} className="px-6 py-3 text-sm flex justify-between">
                                        <span>User #{act.user_id}: {act.action}</span>
                                        <span className="text-gray-500">{new Date(act.timestamp).toLocaleTimeString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            case 'analytics':
                return <PrinterAnalytics token={token} />;
            case 'users':
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Benutzerverwaltung</h2>
                        <div className="bg-white rounded shadow overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Plan</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Rolle</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-sm">
                                                {u.last_name || u.first_name ? `${u.first_name || ''} ${u.last_name || ''}` : <span className="text-gray-400 italic">Kein Name</span>}
                                            </td>
                                            <td className="p-3 text-sm">{u.email}</td>
                                            <td className="p-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs ${u.plan_id > 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.plan_name || 'Free'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm uppercase text-xs font-bold text-gray-500">{u.role}</td>
                                            <td className="p-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs ${u.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {u.account_status || 'active'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm flex gap-2">
                                                <button onClick={() => {
                                                    setEditingUser(u);
                                                    setEditForm({ role: u.role, plan_id: u.plan_id, account_status: u.account_status || 'active' });
                                                }} className="text-indigo-600 hover:text-indigo-800">Bearbeiten</button>

                                                {u.account_status !== 'inactive' ? (
                                                    <button onClick={async () => {
                                                        const res = await fetchWithAuth(API_ENDPOINTS.admin.userById(u.id), { method: 'PUT', body: JSON.stringify({ account_status: 'inactive' }) });
                                                        if (res && res.ok) {
                                                            showNotify('User deaktiviert');
                                                            setUsers(users.map(user => user.id === u.id ? { ...user, account_status: 'inactive' } : user));
                                                        } else {
                                                            showNotify('Fehler beim Deaktivieren', 'error');
                                                        }
                                                    }} className="text-orange-600 hover:text-orange-800" title="Deaktivieren">
                                                        Deaktivieren
                                                    </button>
                                                ) : (
                                                    <button onClick={async () => {
                                                        const res = await fetchWithAuth(API_ENDPOINTS.admin.userById(u.id), { method: 'PUT', body: JSON.stringify({ account_status: 'active' }) });
                                                        if (res && res.ok) {
                                                            showNotify('User aktiviert');
                                                            setUsers(users.map(user => user.id === u.id ? { ...user, account_status: 'active' } : user));
                                                        } else {
                                                            showNotify('Fehler beim Aktivieren', 'error');
                                                        }
                                                    }} className="text-green-600 hover:text-green-800" title="Aktivieren">
                                                        Aktivieren
                                                    </button>
                                                )}

                                                <button onClick={() => {
                                                    setConfirmDelete(u);
                                                }} className="text-red-600 hover:text-red-800">
                                                    Löschen
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <div className="p-4 text-center text-gray-500">Keine Benutzer gefunden.</div>}
                        </div>

                        {/* Custom Confirm Delete Modal */}
                        <SMModal
                            isOpen={!!confirmDelete}
                            onClose={() => setConfirmDelete(null)}
                            title="Benutzer löschen"
                            footer={
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const userId = confirmDelete.id;
                                            setConfirmDelete(null);
                                            const res = await fetchWithAuth(API_ENDPOINTS.admin.userById(userId), { method: 'DELETE' });
                                            if (res && res.ok) {
                                                showNotify('User gelöscht');
                                                setUsers(users.filter(user => user.id !== userId));
                                            } else {
                                                showNotify('Fehler beim Löschen', 'error');
                                            }
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm"
                                    >
                                        Endgültig löschen
                                    </button>
                                </div>
                            }
                        >
                            <div className="flex flex-col items-center text-center p-2">
                                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <X size={32} />
                                </div>
                                <p className="text-gray-900 font-bold text-lg mb-2">User wirklich löschen?</p>
                                <p className="text-gray-500 text-sm">
                                    Möchtest du den Benutzer <span className="text-gray-900 font-semibold">{confirmDelete?.email}</span> wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                                </p>
                            </div>
                        </SMModal>
                    </div>
                );
            case 'settings':
                return (
                    <div className="max-w-2xl bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard size={20} /> Stripe Einstellungen</h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${!settings.stripeLiveMode ? 'text-green-600' : 'text-gray-500'}`}>Sandbox</span>
                                <button
                                    onClick={() => setSettings({ ...settings, stripeLiveMode: !settings.stripeLiveMode })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.stripeLiveMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.stripeLiveMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className={`text-sm font-medium ${settings.stripeLiveMode ? 'text-indigo-600' : 'text-gray-500'}`}>Live</span>
                            </div>
                        </div>

                        {settings.stripeLiveMode ? (
                            <div className="space-y-4 border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50">
                                <h4 className="font-semibold text-indigo-800">Live Keys</h4>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Live Public Key</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="pk_live_..."
                                        value={settings.stripePublicKey || ''}
                                        onChange={e => setSettings({ ...settings, stripePublicKey: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Live Secret Key</label>
                                    <input
                                        type="password"
                                        className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="sk_live_..."
                                        value={settings.stripeSecretKey || ''}
                                        onChange={e => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 border-l-4 border-green-500 pl-4 py-2 bg-green-50/50">
                                <h4 className="font-semibold text-green-800">Sandbox Keys</h4>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sandbox Public Key</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded focus:ring-green-500 focus:border-green-500"
                                        placeholder="pk_test_..."
                                        value={settings.stripeSandboxPublicKey || ''}
                                        onChange={e => setSettings({ ...settings, stripeSandboxPublicKey: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sandbox Secret Key</label>
                                    <input
                                        type="password"
                                        className="w-full border p-2 rounded focus:ring-green-500 focus:border-green-500"
                                        placeholder="sk_test_..."
                                        value={settings.stripeSandboxSecretKey || ''}
                                        onChange={e => setSettings({ ...settings, stripeSandboxSecretKey: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-6">
                            <button onClick={handleTestStripe} disabled={isTesting} className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded hover:bg-indigo-50 transition-colors">
                                {isTesting ? 'Teste...' : 'Verbindung Testen'}
                            </button>
                            <button onClick={handleSaveSettings} disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors">
                                {isSaving ? 'Speichere...' : 'Speichern'}
                            </button>
                        </div>
                    </div>
                );
            case 'emails':
                return <AdminEmailSettings token={token} showNotify={showNotify} />;
            case 'plans':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Pläne</h2><button onClick={() => openPlanModal()} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">+ Neuer Plan</button></div>
                        <div className="bg-white shadow rounded overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase"><th className="px-6 py-3">Name</th><th className="px-6 py-3">Preis</th><th className="px-6 py-3">Typ</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Aktion</th></tr></thead>
                                <tbody className="divide-y divide-gray-200">{plans.map(p => (
                                    <tr key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                                        <td className="px-6 py-4 font-medium">{p.name}</td>
                                        <td className="px-6 py-4">{Number(p.price).toFixed(2)}€</td>
                                        <td className="px-6 py-4 capitalize">{p.type}</td>
                                        <td className="px-6 py-4"><button onClick={() => togglePlanStatus(p)} className={p.is_active ? 'text-green-600' : 'text-gray-400'}>{p.is_active ? 'Aktiv' : 'Inaktiv'}</button></td>
                                        <td className="px-6 py-4 text-right"><button onClick={() => openPlanModal(p)} className="text-indigo-600">Edit</button></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'templates':
                return <TemplateManagement />;
            default: return <div>Wähle einen Menüpunkt</div>;
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}

            {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">User bearbeiten: {editingUser.email}</h3>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Rolle</label>
                                <select className="w-full p-2 border rounded" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></div>
                            <div><label className="block text-sm font-medium mb-1">Plan</label>
                                <select className="w-full p-2 border rounded" value={editForm.plan_id} onChange={e => setEditForm({ ...editForm, plan_id: parseInt(e.target.value) })}><option value={1}>Free</option><option value={2}>PRO</option></select></div>
                            <div><label className="block text-sm font-medium mb-1">Status</label>
                                <select className="w-full p-2 border rounded" value={editForm.account_status} onChange={e => setEditForm({ ...editForm, account_status: e.target.value })}><option value="active">Aktiv</option><option value="suspended">Gesperrt</option></select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEditingUser(null)} className="px-4 py-2 hover:bg-gray-100 rounded">Abbrechen</button>
                            <button onClick={handleUpdateUser} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Speichern</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Modal */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{editingPlan ? 'Plan bearbeiten' : 'Neuer Plan'}</h3>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" className="w-full border p-2 rounded" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} /></div>
                            <div className="flex gap-4">
                                <div className="flex-1"><label className="block text-sm font-medium mb-1">Preis</label><input type="number" step="0.01" className="w-full border p-2 rounded" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} /></div>
                                <div className="flex-1"><label className="block text-sm font-medium mb-1">Typ</label><select className="w-full border p-2 rounded" value={planForm.type} onChange={e => setPlanForm({ ...planForm, type: e.target.value })}><option value="subscription">Abo</option><option value="credits">Credits</option></select></div>
                            </div>
                            {planForm.type === 'credits' && <div><label className="block text-sm font-medium mb-1">Credits</label><input type="number" className="w-full border p-2 rounded" value={planForm.credits} onChange={e => setPlanForm({ ...planForm, credits: e.target.value })} /></div>}
                            <div className="flex items-center gap-2"><input type="checkbox" id="pActive" checked={planForm.is_active} onChange={e => setPlanForm({ ...planForm, is_active: e.target.checked ? 1 : 0 })} /><label htmlFor="pActive">Aktiv</label></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Abbrechen</button>
                            <button type="button" onClick={handleSavePlan} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Speichern</button>
                        </div>
                    </div>
                </div>
            )}

            {/* All modals and overlays are now handled within their specific switch cases or via the Modal component above */}
        </AdminLayout>
    );
};

export default AdminDashboard;
