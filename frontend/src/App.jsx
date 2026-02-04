import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CanvasEditor from './CanvasEditor';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './AdminDashboard';
import PrintSuccess from './pages/PrintSuccess';
import PrintHistory from './pages/PrintHistory';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AGB from './pages/AGB';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Logo } from './components/Logo';
import './App.css';

// Helper to hide header on editor if needed, or customize it
import { User, Settings, Crown, CreditCard } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const { user, logout } = useAuth();

  const getGreeting = () => {
    const h = new Date().getHours();
    const name = user.first_name;
    if (!name) return user.email;
    if (h < 11) return `Guten Morgen, ${name}`;
    if (h < 18) return `Guten Tag, ${name}`;
    return `Guten Abend, ${name}`;
  };

  const getPlanLabel = () => {
    if (!user) return null;
    // Plan Logic: 1=Free, 2=Pro, 3=Business/Credits
    if (user.plan_id === 1) return `Free Plan (${user.credits || 0})`;
    if (user.plan_id === 2) return 'Pro Plan';
    if (user.plan_id === 3) return `Credits Pak (${user.credits})`;
    return 'Free Plan';
  };

  return (
    <header className={`text-white p-4 shadow-md ${isEditor ? 'bg-slate-900' : 'bg-slate-900'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 w-48 hover:opacity-90 transition-opacity">
          <Logo className="text-white" />
        </Link>
        <nav className="flex gap-4 text-sm font-medium items-center">
          {user ? (
            <>
              <Link to="/editor" className="hover:text-indigo-300">Editor</Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 font-bold">Admin</Link>
              )}

              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-600">
                <div className="text-gray-300 flex flex-col items-end">
                  <span className="font-semibold">{getGreeting()}</span>
                  <div className="flex items-center gap-1 text-xs text-indigo-400">
                    {user.plan_id > 1 ? <Crown size={12} /> : <CreditCard size={12} />}
                    {getPlanLabel()}
                  </div>
                </div>

                <Link to="/profile" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Einstellungen">
                  <Settings size={20} className="text-gray-400 hover:text-white" />
                </Link>

                <button onClick={logout} className="hover:text-red-300 text-xs ml-2">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-300">Login</Link>
              <Link to="/editor" className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-500">Kostenlos testen</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/editor" element={<CanvasEditor />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/print/success" element={<PrintSuccess />} />
              <Route path="/dashboard/history" element={<PrintHistory />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/agb" element={<AGB />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
