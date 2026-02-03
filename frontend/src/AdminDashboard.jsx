import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, CreditCard, Settings, FileText, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import Toast from './components/Toast';
import AdminLayout from './components/admin/AdminLayout';
import PrinterAnalytics from './components/admin/PrinterAnalytics';

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
    const [settings, setSettings] = useState({ stripePublicKey: '', stripeSecretKey: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Editing States (Fixing the crash)
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ role: 'user', plan_id: 1, account_status: 'active' });

    // Plan Editing States
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', price: '', type: 'subscription', credits: 0, is_active: 1 });
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    const showNotify = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // Initial Load
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            // navigate('/'); // Uncomment for strict protection
        }

        if (token) {
            setLoading(true);
            Promise.all([
                fetchWithAuth('/api/admin/users'),
                fetchWithAuth('/api/admin/stats'),
                fetchWithAuth('/api/admin/settings'),
                fetchWithAuth('/api/admin/plans')
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
            const res = await fetchWithAuth(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm)
            });
            if (!res) return; // Logout happened

            if (res.ok) {
                showNotify('Benutzer aktualisiert', 'success');
                setEditingUser(null);
                // Refresh list
                const refresh = await fetchWithAuth('/api/admin/users');
                if (refresh && refresh.ok) setUsers(await refresh.json());
            } else {
                showNotify('Fehler beim Aktualisieren', 'error');
            }
        } catch (err) {
            showNotify('Netzwerkfehler', 'error');
        }
    };

    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetchWithAuth(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE'
            });
            if (!res) return;

            if (res.ok) {
                showNotify('Benutzer gelöscht', 'success');
                setUsers(users.filter(u => u.id !== userToDelete.id));
                setUserToDelete(null);
            } else {
                showNotify('Fehler beim Löschen', 'error');
            }
        } catch (err) {
            showNotify('Netzwerkfehler', 'error');
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetchWithAuth('/api/admin/settings', {
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
            const res = await fetchWithAuth('/api/admin/test-stripe', {
                method: 'POST',
                body: JSON.stringify({ stripeSecretKey: settings.stripeSecretKey })
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
        const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';
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
                const refresh = await fetchWithAuth('/api/admin/plans');
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
            const res = await fetchWithAuth(`/api/admin/plans/${plan.id}`, {
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Benutzerverwaltung</h2>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 text-sm font-medium">{u.email}</td>
                                            <td className="px-6 py-4 text-sm"><span className={`px-2 rounded-full text-xs font-bold ${u.plan_id > 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{u.plan_id > 1 ? 'PRO' : 'Free'}</span></td>
                                            <td className="px-6 py-4 text-sm">{u.role}</td>
                                            <td className="px-6 py-4 text-sm flex gap-2">
                                                <button onClick={() => {
                                                    setEditingUser(u);
                                                    setEditForm({ role: u.role, plan_id: u.plan_id, account_status: u.account_status || 'active' });
                                                }} className="text-indigo-600 hover:text-indigo-900 font-medium">Bearbeiten</button>
                                                <button onClick={() => handleDeleteUser(u)} className="text-red-600 hover:text-red-900 font-medium ml-2">Löschen</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="max-w-2xl bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard size={20} /> Stripe Einstellungen</h3>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Public Key</label><input type="text" className="w-full border p-2 rounded" value={settings.stripePublicKey} onChange={e => setSettings({ ...settings, stripePublicKey: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Secret Key</label><input type="password" className="w-full border p-2 rounded" value={settings.stripeSecretKey} onChange={e => setSettings({ ...settings, stripeSecretKey: e.target.value })} /></div>
                            <div className="flex gap-4 pt-2">
                                <button onClick={handleTestStripe} disabled={isTesting} className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded hover:bg-indigo-50">{isTesting ? 'Teste...' : 'Testen'}</button>
                                <button onClick={handleSaveSettings} disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">{isSaving ? 'Speichere...' : 'Speichern'}</button>
                            </div>
                        </div>
                    </div>
                );
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

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle size={24} />
                            <h3 className="text-xl font-bold">Benutzer löschen?</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Bist du sicher, dass du den Benutzer <strong>{userToDelete.email}</strong> löschen möchtest?
                            Alle zugehörigen Daten (Projekte, Historie) werden unwiderruflich entfernt.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setUserToDelete(null)} className="px-4 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium">
                                Abbrechen
                            </button>
                            <button onClick={confirmDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium shadow-sm">
                                Ja, unwiderruflich löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
