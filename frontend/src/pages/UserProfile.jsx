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

    const countries = [
        "Deutschland", "Österreich", "Schweiz", "Frankreich", "Italien", "Spanien", "Niederlande", "Belgien", "Polen", "Tschechien", "Dänemark", "Luxemburg", "Vereinigtes Königreich", "USA", "Kanada", "Türkei", "Griechenland", "Portugal", "Schweden", "Norwegen", "Finnland"
    ];

    const legalForms = [
        "Einzelunternehmer", "GmbH", "UG (haftungsbeschränkt)", "GbR", "OHG", "KG", "GmbH & Co. KG", "AG", "e.K.", "PartG", "Privat", "Sonstige"
    ];

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
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white shadow-2xl z-50 animate-fade-in ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {notification.message}
                </div>
            )}

            {/* Header Area */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-10 max-w-6xl">
                    <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-indigo-600 mb-6 transition-all group font-medium">
                        <ArrowLeft size={20} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        {user?.role === 'admin' || user?.role === 'ADMIN' ? 'Zurück zum Admin-Dashboard' : 'Zurück zum Editor'}
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex flex-col items-start text-left">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-3">Mein Profil</h1>
                            <div className="flex flex-wrap items-center gap-2 text-gray-500">
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100 shadow-sm">
                                    KD-NR: {profile.customer_number || 'Neu'}
                                </span>
                                <span className="text-gray-300 mx-1">|</span>
                                <span className="text-base font-medium">{profile.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-6xl">

                {/* STATUS BAR (Plan & Credits) */}
                <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-indigo-600">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Crown size={32} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Abonnement</p>
                                <h3 className="text-2xl font-black text-gray-900">{profile.plan_id === 1 ? 'Free Plan' : profile.plan_id === 2 ? 'Pro Plan' : 'Business'}</h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/plans')}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                        >
                            Upgrade
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                                <CreditCard size={32} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Guthaben</p>
                                <h3 className="text-2xl font-black text-gray-900">{profile.credits || 0} <span className="text-sm font-medium text-gray-400">Credits</span></h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/transactions')}
                            className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            Transaktionen
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                    <div className="flex flex-col md:flex-row gap-10 items-start">

                        {/* LEFT COLUMN: Personal Data & Address (2/3) */}
                        <div className="w-full md:w-2/3 space-y-10">
                            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                        <User size={20} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900">Persönliche Daten & Anschrift</h2>
                                </div>
                                <div className="p-8 space-y-8">
                                    {/* ROW 1: Anrede */}
                                    <div className="flex flex-col">
                                        <div className="w-[140px]">
                                            <select className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-3 border px-4 font-bold text-gray-900"
                                                value={profile.salutation || ''} onChange={e => setProfile({ ...profile, salutation: e.target.value })}>
                                                <option value="" disabled>ANREDE</option>
                                                <option value="Herr">Herr</option>
                                                <option value="Frau">Frau</option>
                                                <option value="Divers">Divers</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* ROW 2: Vorname & Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <input type="text" className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.first_name || ''} onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                                                placeholder="Vorname" />
                                        </div>
                                        <div>
                                            <input type="text" className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.last_name || ''} onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                                                placeholder="Nachname" />
                                        </div>
                                    </div>

                                    {/* ROW 3: Straße & Hausnummer */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-9">
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                                                <input type="text" className="w-full border-gray-300 rounded-xl pl-11 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border pr-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                    value={profile.street || ''} onChange={e => setProfile({ ...profile, street: e.target.value })}
                                                    placeholder="Strasse" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <input type="text" maxLength={10} className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.house_number || ''} onChange={e => setProfile({ ...profile, house_number: e.target.value })}
                                                placeholder="Hausnummer" />
                                        </div>
                                    </div>

                                    {/* ROW 4: PLZ & Ort */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-4">
                                            <input type="text" maxLength={10} className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.zip || ''} onChange={e => setProfile({ ...profile, zip: e.target.value })}
                                                placeholder="PLZ" />
                                        </div>
                                        <div className="md:col-span-8">
                                            <input type="text" className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })}
                                                placeholder="Ort" />
                                        </div>
                                    </div>

                                    {/* ROW 5: Land */}
                                    <div className="flex flex-col">
                                        <select className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 transition-all"
                                            value={profile.country || 'Deutschland'} onChange={e => setProfile({ ...profile, country: e.target.value })}>
                                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* ROW 6: Telefon */}
                                    <div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-xl pl-11 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border pr-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                placeholder="Telefon" />
                                        </div>
                                    </div>

                                    {/* ROW 7: Mobil */}
                                    <div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-xl pl-11 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border pr-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.mobile || ''} onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                                                placeholder="Mobil" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Company Data (1/3) */}
                        <div className="w-full md:w-1/3 space-y-10">
                            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                        <Briefcase size={20} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900">Firmendaten</h2>
                                </div>
                                <div className="p-8 space-y-8">
                                    {/* ROW 1: Firmenname */}
                                    <div>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-4 text-gray-300" size={18} />
                                            <input type="text" className="w-full border-gray-300 rounded-xl pl-11 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border pr-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.company_name || ''} onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                                placeholder="Firmenname (Optional)" />
                                        </div>
                                    </div>

                                    {/* ROW 2: Rechtsform & USt-IdNr side-by-side */}
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <select className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 transition-all"
                                                value={profile.legal_form || ''} onChange={e => setProfile({ ...profile, legal_form: e.target.value })}>
                                                <option value="" disabled>RECHTSFORM</option>
                                                {legalForms.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <input type="text" className="w-full border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 py-4 border px-6 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:text-xs"
                                                value={profile.vat_id || ''} onChange={e => setProfile({ ...profile, vat_id: e.target.value })}
                                                placeholder="USt-IdNr." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white px-8 py-5 rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 transition-all transform active:scale-95 font-black text-xl group">
                                <Save size={24} className="group-hover:rotate-12 transition-transform" />
                                {isSaving ? 'Speichere...' : 'Änderungen speichern'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
