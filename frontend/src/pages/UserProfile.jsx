import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Plus, Trash2, Edit2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
    const { token, logout } = useAuth();
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
        if (res && res.ok) showNotify('Profil gespeichert');
        else showNotify('Fehler beim Speichern', 'error');
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
            fetchProfile(); // Reload to get updated list
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

    if (loading) return <div className="p-8 text-center">Laden...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {notification && (
                <div className={`fixed top-4 right-4 p-4 rounded text-white shadow-lg z-50 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {notification.message}
                </div>
            )}

            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
                <div>
                    <h1 className="text-2xl font-bold">Mein Profil</h1>
                    <p className="text-gray-500">Kundennummer: {profile.customer_number || '---'} | ID: {profile.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* STAMMDATEN */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={20} /> Persönliche Daten</h2>
                        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Firma (optional)</label>
                                <input type="text" className="w-full border p-2 rounded" value={profile.company_name || ''} onChange={e => setProfile({ ...profile, company_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Anrede</label>
                                <select className="w-full border p-2 rounded" value={profile.salutation || ''} onChange={e => setProfile({ ...profile, salutation: e.target.value })}>
                                    <option value="">Bitte wählen</option>
                                    <option value="Herr">Herr</option>
                                    <option value="Frau">Frau</option>
                                    <option value="Divers">Divers</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">USt-IdNr.</label>
                                <input type="text" className="w-full border p-2 rounded" value={profile.vat_id || ''} onChange={e => setProfile({ ...profile, vat_id: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Vorname</label>
                                <input type="text" className="w-full border p-2 rounded" value={profile.first_name || ''} onChange={e => setProfile({ ...profile, first_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nachname</label>
                                <input type="text" className="w-full border p-2 rounded" value={profile.last_name || ''} onChange={e => setProfile({ ...profile, last_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Telefon</label>
                                <input type="text" className="w-full border p-2 rounded" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Handy</label>
                                <input type="text" className="w-full border p-2 rounded" value={profile.mobile || ''} onChange={e => setProfile({ ...profile, mobile: e.target.value })} />
                            </div>

                            <div className="md:col-span-2 pt-4 flex justify-end">
                                <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                                    <Save size={18} /> {isSaving ? 'Speichere...' : 'Speichern'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ADRESSEN */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin size={20} /> Adressen</h2>
                            <button onClick={() => openAddressModal()} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Plus size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            {addresses.length === 0 && <p className="text-gray-400 text-sm">Keine Adressen hinterlegt</p>}
                            {addresses.map(addr => (
                                <div key={addr.id} className="border rounded p-3 text-sm relative group">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${addr.type === 'billing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {addr.type === 'billing' ? 'Rechnung' : 'Lieferung'}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openAddressModal(addr)} className="text-gray-500 hover:text-indigo-600"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="mt-2 font-medium">
                                        {addr.street} {addr.house_number}<br />
                                        {addr.zip_code} {addr.city}<br />
                                        {addr.country}
                                    </div>
                                    {addr.is_default && <span className="absolute bottom-2 right-2 text-xs text-gray-400 italic">Standard</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">{editingAddress ? 'Adresse bearbeiten' : 'Neue Adresse'}</h3>
                        <form onSubmit={handleSaveAddress} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Typ</label>
                                    <select className="w-full border p-2 rounded" value={addressForm.type} onChange={e => setAddressForm({ ...addressForm, type: e.target.value })}>
                                        <option value="billing">Rechnungsadresse</option>
                                        <option value="shipping">Lieferadresse</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Straße</label>
                                    <input required type="text" className="w-full border p-2 rounded" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nr.</label>
                                    <input required type="text" className="w-full border p-2 rounded" value={addressForm.house_number} onChange={e => setAddressForm({ ...addressForm, house_number: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Zusatz (z.B. Hinterhof, Etage)</label>
                                <input type="text" className="w-full border p-2 rounded" value={addressForm.address_addition || ''} onChange={e => setAddressForm({ ...addressForm, address_addition: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">PLZ</label>
                                    <input required type="text" className="w-full border p-2 rounded" value={addressForm.zip_code} onChange={e => setAddressForm({ ...addressForm, zip_code: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Ort</label>
                                    <input required type="text" className="w-full border p-2 rounded" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Land</label>
                                <input type="text" className="w-full border p-2 rounded" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="defaultAddr" checked={addressForm.is_default} onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })} />
                                <label htmlFor="defaultAddr">Als Standard festlegen</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Abbrechen</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
