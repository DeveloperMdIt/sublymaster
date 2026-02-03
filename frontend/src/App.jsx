import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CanvasEditor from './CanvasEditor';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AdminDashboard from './AdminDashboard';
import PrintSuccess from './pages/PrintSuccess';
import PrintHistory from './pages/PrintHistory';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AGB from './pages/AGB';
import Footer from './components/Footer';
import { Logo } from './components/Logo';
import './App.css';

// Helper to hide header on editor if needed, or customize it
const Navigation = () => {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const { user, logout } = useAuth();

  return (
    <header className={`text-white p-4 shadow-md ${isEditor ? 'bg-slate-900' : 'bg-slate-900'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 w-48 hover:opacity-90 transition-opacity">
          {/* Das Logo ist hier automatisch transparent und der Text wird weiß */}
          <Logo className="text-white" />
        </Link>
        <nav className="flex gap-4 text-sm font-medium items-center">
          <Link to="/editor" className="hover:text-indigo-300">Editor</Link>

          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 font-bold">Admin</Link>
          )}

          {user ? (
            <>
              <span className="text-gray-300">Hallo, {user.email}</span>
              <button onClick={logout} className="hover:text-red-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-300">Login</Link>
              <Link to="/register" className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500">Konto erstellen</Link>
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
        <div className="App min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/editor" element={<CanvasEditor />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
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
