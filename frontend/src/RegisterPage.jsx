import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // added useNavigate
import { Check, X, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Modal from './components/Modal';
import API_ENDPOINTS from './config/api';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); // Hook for navigation
    const { login } = useAuth();
    const plan = searchParams.get('plan') || 'free';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation Rules
    const requirements = [
        { id: 'min', label: 'Mindestens 8 Zeichen', valid: password.length >= 8 },
        { id: 'upper', label: 'Ein Großbuchstabe', valid: /[A-Z]/.test(password) },
        { id: 'lower', label: 'Ein Kleinbuchstabe', valid: /[a-z]/.test(password) },
        { id: 'num', label: 'Eine Zahl', valid: /[0-9]/.test(password) },
        { id: 'special', label: 'Ein Sonderzeichen (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const allValid = requirements.every(r => r.valid);
    const match = password === confirmPassword && password !== '';

    const [showModal, setShowModal] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [tempUser, setTempUser] = useState(null); // Stores {email, password}

    const completeRegistration = async (selectedPlan) => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.register, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: tempUser.email,
                    password: tempUser.password,
                    plan: selectedPlan
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registrierung fehlgeschlagen');
            }

            // Success - Instead of login, we show success state
            setRegistrationSuccess(true);
            setShowModal(true);
            // login(data.user, data.token); // Disabled for email verification flow
            // navigate('/editor');

        } catch (err) {
            setError(err.message);
            setShowModal(false); // Close modal to show error on form? Or show error in modal?
            // For now, close and show on form
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        // If they close without picking, default to free
        completeRegistration('free');
    };

    const handlePlanSelect = (planType) => {
        console.log("Selected plan:", planType);
        if (planType === 'pro' || planType === 'credits') {
            // In a real app, we'd redirect to Stripe here.
            // For this MVP, we just register them with that plan active.
            // alert('Payment would happen here.');
        }
        completeRegistration(planType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched(true);
        setError('');

        if (allValid && match) {
            // Store credentials and open plan selection
            setTempUser({ email, password });
            setShowModal(true);
        }
    };

    return (
        <>
            <Modal
                isOpen={showModal}
                onClose={() => !registrationSuccess && setShowModal(false)}
                title={registrationSuccess ? "Fast geschafft!" : "Willkommen bei Sublymaster!"}
                footer={
                    registrationSuccess ? (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all w-full shadow-lg shadow-indigo-200"
                        >
                            Zum Login
                        </button>
                    ) : (
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={closeModal}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Später
                            </button>
                            <button
                                onClick={() => handlePlanSelect('pro')}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                            >
                                Jetzt wählen
                            </button>
                        </div>
                    )
                }
            >
                {registrationSuccess ? (
                    <div className="py-4 text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <Mail size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Prüfe dein Postfach!</h4>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Wir haben dir eine Bestätigungs-Email an <span className="font-bold text-indigo-600">{email}</span> gesendet.
                        </p>
                        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            Bitte klicke auf den Link in der Email, um dein Konto zu aktivieren. Danach kannst du dich einloggen und direkt loslegen!
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mb-4">Deine Registrierung war erfolgreich. Wähle jetzt deinen Plan, um direkt loszulegen:</p>
                        <div className="space-y-3">
                            <div
                                onClick={() => handlePlanSelect('free')}
                                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${plan === 'free' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold">Kostenloser Plan</span>
                                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">0€</span>
                                </div>
                                <p className="text-xs text-gray-500">Teste Sublimaster mit Basisfunktionen.</p>
                            </div>

                            <div
                                onClick={() => handlePlanSelect('pro')}
                                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${plan === 'pro' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-indigo-600">Pro Plan</span>
                                    <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded text-white font-bold">Empfohlen</span>
                                </div>
                                <p className="text-xs text-gray-500">Unlimitierte Designs, KI-Features und mehr.</p>
                            </div>
                        </div>
                    </>
                )}
            </Modal>

            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Konto erstellen
                    </h2>
                    {plan !== 'free' && (
                        <div className="mt-4 text-center">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                Gewählter Plan: {plan === 'credits' ? '10er Karte' : 'Pro Abo'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email Adresse
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Passwort
                            </label>
                            <div className="mt-2 relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 pr-10"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div className="mt-2 space-y-1">
                                {requirements.map((req) => (
                                    <div key={req.id} className={`flex items-center text-xs ${req.valid ? 'text-green-600' : 'text-gray-500'}`}>
                                        {req.valid ? <Check className="w-3 h-3 mr-1" /> : <div className="w-3 h-3 mr-1" />}
                                        <span className={req.valid ? '' : touched ? 'text-red-500' : ''}>{req.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                                Passwort wiederholen
                            </label>
                            <div className="mt-2 relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 pr-10 ${(!match && confirmPassword) ? 'ring-red-300 focus:ring-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {confirmPassword && !match && (
                            <p className="mt-1 text-xs text-red-600">Passwörter stimmen nicht überein</p>
                        )}
                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={!allValid || !match || isLoading}
                                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${allValid && match && !isLoading ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {isLoading ? 'Laden...' : 'Weiter zur Zahlung'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Bereits registriert?{' '}
                        <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            Einloggen
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
