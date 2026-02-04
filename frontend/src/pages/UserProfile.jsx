import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Crown, CreditCard, User, MapPin, Phone, Briefcase, Building, Save, ExternalLink } from 'lucide-react';
import PlansModal from '../components/PlansModal';

export default function UserProfile() {
    const { token, logout, login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const [notification, setNotification] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('openPlans') === 'true') {
            setIsPlansModalOpen(true);
        }
    }, [location]);

    const getPlanLabel = () => {
        if (!user) return 'Free Plan';
        if (user.plan_id === 1) return 'Free Plan';
        if (user.plan_id === 2) return 'Pro Plan';
        if (user.plan_id === 3) return 'Business Plan';
        return 'Free Plan';
    };

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
            zip_code: profile.zip,
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

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Lade Profil...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl text-white shadow-2xl z-50 animate-fade-in font-bold ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {notification.message}
                </div>
            )}

            <div className="container mx-auto px-6 py-10 max-w-7xl text-left">

                {/* TOP CARDS: Subscription & Credits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Subscription Card */}
                    <div className="bg-white rounded-xl border-l-[6px] border-l-indigo-600 border-y border-r border-gray-100 p-6 shadow-xl shadow-gray-200/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                <Crown size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Abonnement</p>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{getPlanLabel()}</h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPlansModalOpen(true)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                            Upgrade
                        </button>
                    </div>

                    {/* Credits Card */}
                    <div className="bg-white rounded-xl border-l-[6px] border-l-emerald-500 border-y border-r border-gray-100 p-6 shadow-xl shadow-gray-200/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Guthaben</p>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">
                                    {user?.credits || 0} <span className="text-sm font-bold text-slate-400 ml-1">Credits</span>
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/transactions')}
                            className="flex items-center gap-1.5 text-emerald-600 font-black text-sm hover:text-emerald-700 transition-colors"
                        >
                            Transaktionen
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8 text-left">
                    <div className="grid grid-cols-12 gap-6 items-start">
                        {/* LINKE SEITE (2/3): Persönliche Daten */}
                        <section className="col-span-12 lg:col-span-8">
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50 overflow-hidden">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                                        <User size={20} />
                                    </div>
                                    <h2 className="text-base font-bold text-gray-900">Persönliche Daten & Anschrift</h2>
                                </div>

                                <div className="grid grid-cols-12 gap-4">
                                    {/* ZEILE 1: ANREDE (3), VORNAME (4), NACHNAME (5) */}
                                    <div className="col-span-12 sm:col-span-3">
                                        <select
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white outline-none"
                                            value={profile.salutation || ''}
                                            onChange={e => setProfile({ ...profile, salutation: e.target.value })}
                                        >
                                            <option value="" disabled>Anrede</option>
                                            <option value="Herr">Herr</option>
                                            <option value="Frau">Frau</option>
                                            <option value="Divers">Divers</option>
                                        </select>
                                    </div>

                                    <div className="col-span-12 sm:col-span-4">
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                            placeholder="Vorname"
                                            value={profile.first_name || ''}
                                            onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-12 sm:col-span-5">
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                            placeholder="Nachname"
                                            value={profile.last_name || ''}
                                            onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                                        />
                                    </div>

                                    {/* ZEILE 2: STRASSE (9) & HAUSNUMMER (3) */}
                                    <div className="col-span-12 sm:col-span-9">
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 !pl-12 pr-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                                placeholder="Straße"
                                                value={profile.street || ''}
                                                onChange={e => setProfile({ ...profile, street: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-12 sm:col-span-3">
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                            placeholder="Nr."
                                            value={profile.house_number || ''}
                                            onChange={e => setProfile({ ...profile, house_number: e.target.value })}
                                        />
                                    </div>

                                    {/* ZEILE 3: PLZ (4) & ORT (8) */}
                                    <div className="col-span-12 sm:col-span-4">
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                            placeholder="PLZ"
                                            value={profile.zip || ''}
                                            onChange={e => setProfile({ ...profile, zip: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-12 sm:col-span-8">
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                            placeholder="Ort"
                                            value={profile.city || ''}
                                            onChange={e => setProfile({ ...profile, city: e.target.value })}
                                        />
                                    </div>

                                    {/* ZEILE 4: LAND (VOLLE BREITE) */}
                                    <div className="col-span-12">
                                        <select
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white outline-none"
                                            value={profile.country || 'Deutschland'}
                                            onChange={e => setProfile({ ...profile, country: e.target.value })}
                                        >
                                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* ZEILE 5: TELEFON & MOBIL */}
                                    <div className="col-span-12 sm:col-span-6">
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 !pl-12 pr-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                                placeholder="Telefon"
                                                value={profile.phone || ''}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-12 sm:col-span-6">
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 !pl-12 pr-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                                placeholder="Mobil"
                                                value={profile.mobile || ''}
                                                onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* RECHTE SEITE (1/3): Firmendaten */}
                        <aside className="col-span-12 lg:col-span-4 space-y-6">
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                                        <Briefcase size={20} />
                                    </div>
                                    <h2 className="text-base font-bold text-gray-900">Firmendaten</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 !pl-12 pr-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                            placeholder="Firma"
                                            value={profile.company_name || ''}
                                            onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                        />
                                    </div>

                                    <select
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white outline-none"
                                        value={profile.legal_form || ''}
                                        onChange={e => setProfile({ ...profile, legal_form: e.target.value })}
                                    >
                                        <option value="" disabled>Rechtsform</option>
                                        {legalForms.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>

                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                        placeholder="USt-IdNr."
                                        value={profile.vat_id || ''}
                                        onChange={e => setProfile({ ...profile, vat_id: e.target.value })}
                                    />
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Speichern Button - Wieder unten über volle Breite */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-black text-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <Save size={24} />
                            {isSaving ? 'Speichere...' : 'Änderungen speichern'}
                        </button>
                    </div>
                </form>

                <PlansModal
                    isOpen={isPlansModalOpen}
                    onClose={() => setIsPlansModalOpen(false)}
                    onSelectPlan={(planId) => {
                        console.log('Selected plan:', planId);
                        setIsPlansModalOpen(false);
                        showNotify('Plan-Auswahl wird verarbeitet...');
                    }}
                />
            </div>
        </div>
    );
}
