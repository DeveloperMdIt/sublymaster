import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, ArrowLeft, Building, Phone, MapPin, CreditCard, Crown, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
    const { token, logout, login, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const [notification, setNotification] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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

            // Extract billing address to merge into main profile form
            const billingAddr = (data.addresses || []).find(a => a.type === 'billing') || {};

            const mergedProfile = {
                ...data, // master data
                street: billingAddr.street || '',
                house_number: billingAddr.house_number || '',
                zip: billingAddr.zip || billingAddr.zip_code || '',
                city: billingAddr.city || '',
                country: billingAddr.country || 'Deutschland'
            };

            setProfile(mergedProfile);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            ...profile,
            street: profile.street,
            house_number: profile.house_number,
            zip: profile.zip,
            city: profile.city,
            country: profile.country
        };

        const res = await fetchWithAuth('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            showNotify('Profil & Adresse gespeichert');
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            login({ ...storedUser, first_name: profile.first_name }, token);
            fetchProfile();
        } else {
            showNotify('Fehler beim Speichern', 'error');
        }
        setIsSaving(false);
    };

    const handleBack = () => {
        if (user?.role === 'admin' || user?.role === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate('/editor');
        }
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
                    <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                        <ArrowLeft size={18} className="mr-2" />
                        {user?.role === 'admin' || user?.role === 'ADMIN' ? 'Zurück zum Admin-Dashboard' : 'Zurück zum Editor'}
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mein Profil</h1>
                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-medium">
                                    KD-NR: {profile.customer_number || 'Neu'}
                                </span>
                                <span className="text-sm text-gray-400">|</span>
                                <span className="text-sm">{profile.email}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-6xl">

                {/* STATUS BAR (Plan & Credits) */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Crown size={32} />
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm font-medium">Aktueller Plan</p>
                                <h3 className="text-2xl font-bold">{profile.plan_id === 1 ? 'Free Plan' : profile.plan_id === 2 ? 'Pro Plan' : 'Business'}</h3>
                            </div>
                        </div>
                        <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-50 transition-colors">Upgrade</button>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                                <CreditCard size={32} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Guthaben</p>
                                <h3 className="text-2xl font-bold text-gray-800">{profile.credits || 0} <span className="text-sm font-normal text-gray-400">Credits</span></h3>
                            </div>
                        </div>
                        <button className="text-indigo-600 font-medium hover:text-indigo-800 text-sm">Transaktionen ansehen</button>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Personal Data & Address (8/12) */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b bg-gray-50/50 flex items-center gap-3">
                                    <User className="text-indigo-600" size={24} />
                                    <h2 className="text-xl font-bold text-gray-800">Persönliche Daten & Anschrift</h2>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Anrede</label>
                                            <select className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.salutation || ''} onChange={e => setProfile({ ...profile, salutation: e.target.value })}>
                                                <option value="">Wählen</option>
                                                <option value="Herr">Herr</option>
                                                <option value="Frau">Frau</option>
                                                <option value="Divers">Divers</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.first_name || ''} onChange={e => setProfile({ ...profile, first_name: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.last_name || ''} onChange={e => setProfile({ ...profile, last_name: e.target.value })} />
                                        </div>

                                        <div className="md:col-span-12 border-t border-gray-100 my-2"></div>

                                        <div className="md:col-span-9">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Straße</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.street || ''} onChange={e => setProfile({ ...profile, street: e.target.value })}
                                                placeholder="Hauptstraße" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hausnummer</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.house_number || ''} onChange={e => setProfile({ ...profile, house_number: e.target.value })}
                                                placeholder="1A" />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.zip || ''} onChange={e => setProfile({ ...profile, zip: e.target.value })}
                                                placeholder="12345" />
                                        </div>
                                        <div className="md:col-span-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })}
                                                placeholder="Musterstadt" />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
                                            <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                                value={profile.country || 'Deutschland'} onChange={e => setProfile({ ...profile, country: e.target.value })} />
                                        </div>

                                        <div className="md:col-span-12 border-t border-gray-100 my-2"></div>

                                        <div className="md:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                                <input type="text" className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                                                    value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobil</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                                <input type="text" className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                                                    value={profile.mobile || ''} onChange={e => setProfile({ ...profile, mobile: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Company Data (4/12) */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b bg-gray-50/50 flex items-center gap-3">
                                    <Briefcase className="text-indigo-600" size={24} />
                                    <h2 className="text-xl font-bold text-gray-800">Firmendaten</h2>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                                                value={profile.company_name || ''} onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                                placeholder="Musterfirma GmbH" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">USt-IdNr.</label>
                                        <input type="text" className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3"
                                            value={profile.vat_id || ''} onChange={e => setProfile({ ...profile, vat_id: e.target.value })}
                                            placeholder="DE123456789" />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button in the right column or spanning bottom? User screenshot had it bottom right. */}
                            {/* I will place it here for visual balance in the company card or below it. */}
                            <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all transform active:scale-95 font-bold text-lg">
                                <Save size={24} /> {isSaving ? 'Speichere...' : 'Änderungen speichern'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
