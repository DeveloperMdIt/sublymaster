import React from 'react';
import { X, Check, Crown, CreditCard } from 'lucide-react';

const PlansModal = ({ isOpen, onClose, onSelectPlan }) => {
    if (!isOpen) return null;

    const plans = [
        {
            id: 'credits_10',
            name: '10er Karte',
            price: '4,99€',
            period: 'einmalig',
            desc: 'Ideal für den Start.',
            features: ['10 Downloads', 'Funktionsumfang', 'Kein Wasserzeichen'],
            button: 'Jetzt kaufen',
            color: 'indigo'
        },
        {
            id: 'pro',
            name: 'Pro Abo',
            price: '9,99€',
            period: '/ Mo',
            desc: 'Für regelmäßigen Druck.',
            features: ['Unbegrenzt', 'Bevorzugter Support', 'Kommerzielle Nutzung'],
            button: 'Abo starten',
            color: 'emerald',
            popular: true
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-black text-gray-900 text-center">Wählen Sie Ihren Plan</h2>
                    <p className="text-gray-500 text-center mt-2">Mehr Möglichkeiten für Ihre Sublimations-Projekte.</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl flex flex-col ${plan.popular ? 'border-emerald-500 shadow-emerald-50' : 'border-gray-100 hover:border-indigo-100'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 right-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    Beliebt
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-black text-gray-900 mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                                    <span className="text-xs text-gray-400 font-medium">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className={`p-0.5 rounded-full ${plan.popular ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => onSelectPlan(plan.id)}
                                className={`w-full py-3 rounded-xl text-sm font-black transition-all transform active:scale-95 ${plan.popular
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600'
                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                                    }`}
                            >
                                {plan.button}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="px-8 pb-8 text-center">
                    <p className="text-[10px] text-gray-400">Jederzeit kündbar. Alle Preise inkl. MwSt.</p>
                </div>
            </div>
        </div>
    );
};

export default PlansModal;
