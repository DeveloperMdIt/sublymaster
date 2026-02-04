import React from 'react';
import { LayoutDashboard, Users, Printer, CreditCard, Settings, LogOut, FileText, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">


                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem
                        icon={<Printer size={20} />}
                        label="Drucker-Analytik"
                        active={activeTab === 'analytics'}
                        onClick={() => setActiveTab('analytics')}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label="User-Management"
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarItem
                        icon={<CreditCard size={20} />}
                        label="Pläne & Finanzen"
                        active={activeTab === 'plans'}
                        onClick={() => setActiveTab('plans')}
                    />
                    <SidebarItem
                        icon={<FileText size={20} />}
                        label="Vorlagen"
                        active={activeTab === 'templates'}
                        onClick={() => setActiveTab('templates')}
                    />
                    <SidebarItem
                        icon={<Mail size={20} />}
                        label="Emails"
                        active={activeTab === 'emails'}
                        onClick={() => setActiveTab('emails')}
                    />
                    <SidebarItem
                        icon={<Settings size={20} />}
                        label="Einstellungen"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-slate-800"
                    >
                        <LogOut size={18} />
                        <span>Abmelden</span>
                    </button>
                    <div className="mt-4 text-center text-xs text-slate-600">
                        v1.1.0-beta • Admin
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
                {/* Header for Mobile/Context - could be added here */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {children}
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
            {icon}
        </span>
        <span className="font-medium tracking-wide">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow"></div>}
    </button>
);

export default AdminLayout;
