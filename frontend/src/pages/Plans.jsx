import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, CreditCard, Sparkles } from 'lucide-react';

export default function Plans() {
    const navigate = useNavigate();

    const plans = [
        {
            id: 'credits_10',
            name: '10er Karte',
            price: '4,99€',
            period: 'einmalig',
            desc: 'Ideal für den Start ohne Verpflichtungen.',
            features: ['10 Downloads inklusive', 'Voller Funktionsumfang', 'Kein Wasserzeichen', 'Unbegrenzte Gültigkeit'],
            button: 'Jetzt kaufen',
            color: 'indigo'
        },
        {
            id: 'pro',
            name: 'Pro Abo',
            price: '9,99€',
            period: '/ Monat',
            desc: 'Für alle, die regelmäßig drucken.',
            features: ['Unbegrenzte Downloads', 'Bevorzugter Support', 'Kommerzielle Nutzung', 'Jederzeit kündbar', 'Priorisierte Verarbeitung'],
            button: 'Abo starten',
            color: 'emerald',
            popular: true
        }
    ];

    const handleSelectPlan = (planId) => {
        // Here we would link to Stripe Checkout in a real app
        // For now, we show a message or redirect to a mock checkout
        alert(`Upgrade auf ${planId} wird vorbereitet... (Stripe Integration folgt)`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="bg-slate-900 text-white py-20 px-6">
                <div className="container mx-auto max-w-4xl text-center">
                    <button onClick={() => navigate('/profile')} className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-all group font-medium">
                        <ArrowLeft size={20} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        Zurück zum Profil
                    </button>
                    <h1 className="text-5xl font-black mb-4 tracking-tight">Wählen Sie Ihren Plan</h1>
                    <p className="text-xl text-gray-400">Mehr Möglichkeiten für Ihre Sublimations-Projekte.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-16 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plans.map((p) => (
                        <div key={p.id} className={`bg-white rounded-3xl p-10 shadow-2xl border-2 transition-all hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden ${p.popular ? 'border-emerald-500' : 'border-transparent'}`}>
                            {p.popular && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                    <Sparkles size={12} /> Beliebt
                                </div>
                            )}
                            <div>
                                <h3 className={`text-3xl font-black mb-2 ${p.color === 'indigo' ? 'text-indigo-600' : 'text-emerald-600'}`}>{p.name}</h3>
                                <p className="text-gray-500 font-medium mb-8 leading-relaxed">{p.desc}</p>

                                <div className="flex items-baseline gap-1 mb-10">
                                    <span className="text-5xl font-black text-gray-900">{p.price}</span>
                                    <span className="text-gray-400 font-bold">{p.period}</span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {p.features.map((f, i) => (
                                        <li key={i} className="flex gap-3 items-start text-gray-700 font-medium">
                                            <div className={`mt-0.5 p-0.5 rounded-full ${p.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleSelectPlan(p.id)}
                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 ${p.color === 'indigo' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                                    }`}
                            >
                                {p.button}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-white rounded-3xl p-10 border border-gray-100 shadow-xl max-w-3xl mx-auto text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <CreditCard size={32} className="text-gray-300" />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-2">Sichere Zahlung</h4>
                    <p className="text-gray-500 font-medium">Wir verwenden Stripe für eine sichere Abwicklung. Alle gängigen Zahlungsmethoden wie Kreditkarte, PayPal und Klarna werden unterstützt.</p>
                </div>
            </div>
        </div>
    );
}
