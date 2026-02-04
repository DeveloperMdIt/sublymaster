import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Plus, Trash2, Edit2, Save, ArrowLeft, Building, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
    const { token, logout, login } = useAuth(); // Need login to update local user state if changed
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const [addresses, setAddresses] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Address Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        type: 'billing', street: '', house_number: '', address_addition: '',
        zip_code: '', city: '', country: 'Deutschland', is_default: false
    });

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchWithAuth = async (url, options = {}) => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };
        try {
            const res = await fetch(url, { ...options, headers });
            if (res.status === 401) { logout(); return null; }
            return res;
        } catch (error) { console.error(error); return null; }
    };

    const fetchProfile = async () => {
        const res = await fetchWithAuth('/api/user/profile');
        if (res && res.ok) {
            const data = await res.json();
            setProfile(data);
            setAddresses(data.addresses || []);
            setLoading(false);

            // Update local user context if name changed to update header greeting immediately
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (storedUser.first_name !== data.first_name) {
                const updatedUser = { ...storedUser, first_name: data.first_name };
                login(updatedUser, token);
            }
        }
    };

    useEffect(() => {
        if (token) fetchProfile();
    }, [token]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await fetchWithAuth('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profile)
        });
        if (res && res.ok) {
            showNotify('Profil gespeichert');
            // Update local context immediately for greeting
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            login({ ...storedUser, first_name: profile.first_name }, token);
        } else {
            showNotify('Fehler beim Speichern', 'error');
        }
        setIsSaving(false);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const res = await fetchWithAuth('/api/user/addresses', {
            method: 'POST',
            body: JSON.stringify(addressForm)
        });
        if (res && res.ok) {
            showNotify('Adresse gespeichert');
            setShowAddressModal(false);
            fetchProfile();
        } else showNotify('Fehler beim Speichern', 'error');
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Adresse wirklich löschen?')) return;
        const res = await fetchWithAuth(`/api/user/addresses/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
            showNotify('Adresse gelöscht');
            fetchProfile();
        }
    };

    const openAddressModal = (addr = null) => {
        if (addr) {
            setAddressForm(addr);
            setEditingAddress(addr);
        } else {
            setAddressForm({
                type: 'billing', street: '', house_number: '', address_addition: '',
                zip_code: '', city: '', country: 'Deutschland', is_default: false
            });
            setEditingAddress(null);
        }
        setShowAddressModal(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Lade Profil...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white shadow-xl z-50 animate-fade-in ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {notification.message}
                </div>
            )}

            {/* Header Area */}
            <div className="bg-white shadow">
                <div className="container mx-auto px-6 py-8">
                    <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Zurück zum Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mein Profil & Einstellungen</h1>
                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-medium">
                                    {profile.customer_number || 'Neu'}
                                </span>
                                <span className="text-sm">{profile.email}</span>
                            </p>
                        </div>
                        {/* Internal ID hidden as requested */}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Master Data */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <User size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Persönliche Daten</h2>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                {/* Company Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                                                value={profile.company_name || ''} onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                                placeholder="z.B. Musterfirma GmbH" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">USt-IdNr.</label>
                                        <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                            value={profile.vat_id || ''} onChange={e => setProfile({ ...profile, vat_id: e.target.value })}
                                            placeholder="DE123456789" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 my-4"></div>

                                {/* Personal Section */}
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Anrede</label>
                                        <select className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                            value={profile.salutation || ''} onChange={e => setProfile({ ...profile, salutation: e.target.value })}>
                                            <option value="">Bitte wählen</option>
                                            <option value="Herr">Herr</option>
                                            <option value="Frau">Frau</option>
                                            <option value="Divers">Divers</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                                        <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                            value={profile.first_name || ''} onChange={e => setProfile({ ...profile, first_name: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                                        <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                            value={profile.last_name || ''} onChange={e => setProfile({ ...profile, last_name: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                                                value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobil</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                                                value={profile.mobile || ''} onChange={e => setProfile({ ...profile, mobile: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all transform active:scale-95">
                                        <Save size={18} /> {isSaving ? 'Speichere...' : 'Änderungen speichern'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Addresses + Account Info */}
                    <div className="space-y-8">
                        {/* Account Info Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl shadow-lg text-white">
                            <h3 className="text-lg font-semibold mb-2">Mein Paket</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm">Aktueller Plan</p>
                                    <p className="text-2xl font-bold">{profile.plan_id === 1 ? 'Free Plan' : profile.plan_id === 2 ? 'Pro Plan' : 'Business'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-indigo-100 text-sm">Credits</p>
                                    <p className="text-2xl font-bold">{profile.credits || 0}</p>
                                </div>
                            </div>
                            <button className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded border border-white/20 transition-colors text-sm">
                                Upgrade Plan
                            </button>
                        </div>

                        {/* Addresses */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800"><MapPin size={20} className="text-indigo-600" /> Adressbuch</h2>
                                <button onClick={() => openAddressModal()} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"><Plus size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                {addresses.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-sm">Noch keine Adressen hinterlegt.</p>
                                    </div>
                                )}
                                {addresses.map(addr => (
                                    <div key={addr.id} className="border border-gray-200 rounded-lg p-4 relative group hover:shadow-md transition-shadow bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${addr.type === 'billing' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                {addr.type === 'billing' ? 'Rechnung' : 'Lieferung'}
                                            </span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openAddressModal(addr)} className="text-gray-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 leading-relaxed">
                                            <p className="font-medium text-gray-900">{addr.street} {addr.house_number}</p>
                                            {addr.address_addition && <p className="text-xs text-gray-500">{addr.address_addition}</p>}
                                            <p>{addr.zip_code} {addr.city}</p>
                                            <p className="text-gray-400 font-light">{addr.country}</p>
                                        </div>
                                        {addr.is_default && <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium italic">Standard</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Modal */}
                {showAddressModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full transform transition-all scale-100">
                            <h3 className="text-xl font-bold mb-6 text-gray-800">{editingAddress ? 'Adresse bearbeiten' : 'Neue Adresse hinzufügen'}</h3>
                            <form onSubmit={handleSaveAddress} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Adress-Typ</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 border rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-colors ${addressForm.type === 'billing' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="type" value="billing" checked={addressForm.type === 'billing'} onChange={() => setAddressForm({ ...addressForm, type: 'billing' })} className="hidden" />
                                            <Building size={16} /> Rechnung
                                        </label>
                                        <label className={`flex-1 border rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-colors ${addressForm.type === 'shipping' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="type" value="shipping" checked={addressForm.type === 'shipping'} onChange={() => setAddressForm({ ...addressForm, type: 'shipping' })} className="hidden" />
                                            <MapPin size={16} /> Lieferung
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Straße</label>
                                        <input required type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nr.</label>
                                        <input required type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500" value={addressForm.house_number} onChange={e => setAddressForm({ ...addressForm, house_number: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Adresszusatz</label>
                                    <input type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500" value={addressForm.address_addition || ''} onChange={e => setAddressForm({ ...addressForm, address_addition: e.target.value })} placeholder="z.B. 2. Etage" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">PLZ</label>
                                        <input required type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500" value={addressForm.zip_code} onChange={e => setAddressForm({ ...addressForm, zip_code: e.target.value })} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Ort</label>
                                        <input required type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Land</label>
                                    <input type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="defaultAddr" className="rounded text-indigo-600 focus:ring-indigo-500" checked={addressForm.is_default} onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })} />
                                    <label htmlFor="defaultAddr" className="text-sm text-gray-700 select-none cursor-pointer">Als Standardadresse festlegen</label>
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                                    <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 hover:bg-gray-100 rounded text-gray-600">Abbrechen</button>
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-lg shadow-indigo-200">Speichern</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
