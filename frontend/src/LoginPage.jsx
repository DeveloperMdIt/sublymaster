import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Modal from './components/Modal';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const closeModal = () => {
        setShowModal(false);
        navigate('/editor');
    };

    const handlePlanSelect = (planType) => {
        console.log("Selected plan:", planType);
        if (planType === 'pro') {
            alert('Payment Gateway would open here. Continued as Free for now.');
        }
        closeModal();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login fehlgeschlagen');
            }

            // Success via Context
            login(data.user, data.token);

            // Check Plan
            if (data.user.plan_id === 1) { // 1 = Free
                setShowModal(true);
            } else {
                navigate('/editor');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Einloggen
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email Adresse
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Passwort
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Lade...' : 'Einloggen'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Noch kein Konto?{' '}
                    <Link to="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        Hier registrieren
                    </Link>
                </p>
            </div>

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title="Willkommen zurück!"
                footer={
                    <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={closeModal}>
                        Später
                    </button>
                }
            >
                <p className="mb-4">Möchtest du heute auf Pro upgraden und das Wasserzeichen entfernen?</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                    <div className="border rounded-lg p-4 opacity-75 cursor-default text-center bg-gray-50">
                        <h4 className="font-bold text-gray-500">Aktuell: Free</h4>
                        <p className="text-gray-400 font-bold text-xl my-2">0 €</p>
                        <div className="text-xs text-green-600 font-bold mt-2">AKTIV</div>
                    </div>
                    <div className="border-2 border-indigo-600 rounded-lg p-4 relative cursor-pointer text-center bg-white shadow-lg" onClick={() => handlePlanSelect('pro')}>
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-bl">TIPP</div>
                        <h4 className="font-bold text-lg text-indigo-900">Pro</h4>
                        <p className="text-indigo-600 font-bold text-xl my-2">9,99 €</p>
                        <button className="mt-2 w-full bg-indigo-600 text-white py-1 rounded text-sm hover:bg-indigo-700">Jetzt Upgraden</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LoginPage;
