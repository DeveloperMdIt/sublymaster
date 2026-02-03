import { Link } from 'react-router-dom';
import { Check, Printer, Scissors, Layers } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8 bg-gray-900 text-white pb-24">
                <div className="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Perfekte Sublimations-Drucke
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Dein Tool für Tassen, Shirts und mehr. <br />
                        Automatisch gespiegelt. Exakt ma&szlig;haltig. Sofort druckbereit.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link to="/editor" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 transition-all">
                            Jetzt kostenlos testen
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features as Cards */}
            <div className="py-24 bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center mb-16">
                        <h2 className="text-base font-semibold leading-7 text-indigo-600">Features</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Alles was du brauchst
                        </p>
                    </div>

                    <div className="mx-auto max-w-7xl lg:max-w-none">
                        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                            {[
                                { name: 'Auto-Spiegeln', desc: 'Nie wieder vergessen zu spiegeln. Wir erledigen das automatisch vor dem Export.', icon: Printer },
                                { name: 'Exakte Maße', desc: 'Vordefinierte Templates für Tassen (11oz) und A4 Papier verhindern Fehl-Drucke.', icon: Layers },
                                { name: 'Smart Layout', desc: 'Bilder mit einem Klick zentrieren, ausrichten oder auf maximale Größe skalieren.', icon: Scissors },
                                { name: 'High-Res Export', desc: 'Kristallklare PDFs mit 300 DPI für gestochen scharfe Sublimations-Ergebnisse.', icon: Check },
                            ].map((feature) => (
                                <div key={feature.name} className="flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 transition-transform hover:-translate-y-1 hover:shadow-md">
                                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <dt className="text-lg font-bold leading-7 text-gray-900">{feature.name}</dt>
                                    <dd className="mt-2 flex-auto text-base leading-7 text-gray-600">{feature.desc}</dd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Side-by-Side */}
            <div className="py-24 sm:py-32 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl sm:text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Preise</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">Flexibel bleiben: Einmalzahlung oder Abo.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">

                        {/* 10er Karte */}
                        <div className="rounded-3xl p-8 ring-1 ring-gray-200 bg-gray-50 flex flex-col justify-between hover:ring-indigo-200 transition-all">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900">10er Karte</h3>
                                <p className="mt-4 text-sm leading-6 text-gray-600">Ideal für den Start ohne Verpflichtungen.</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">4,99€</span>
                                    <span className="text-sm font-semibold leading-6 text-gray-600">einmalig</span>
                                </p>
                                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                                    {['10 Downloads inklusive', 'Voller Funktionsumfang', 'Kein Wasserzeichen', 'Unbegrenzte Gültigkeit'].map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link to="/register?plan=credits" className="mt-8 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                Zugang kaufen
                            </Link>
                        </div>

                        {/* Pro Abo */}
                        <div className="rounded-3xl p-8 ring-1 ring-indigo-200 bg-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BELIEBT</div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-indigo-600">Pro Abo</h3>
                                <p className="mt-4 text-sm leading-6 text-gray-600">Für alle, die regelmäßig drucken.</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">9,99€</span>
                                    <span className="text-sm font-semibold leading-6 text-gray-600">/ Monat</span>
                                </p>
                                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                                    {['Unbegrenzte Downloads', 'Bevorzugter Support', 'Kommerzielle Nutzung', 'Jederzeit kündbar'].map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link to="/register?plan=pro" className="mt-8 block w-full rounded-md bg-indigo-100 px-3 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-200">
                                Abo starten
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
