import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import { logoutUser_api } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import ClientOrders from '../../components/dashboard/ClientOrders';
import ProfileSettings from '../../components/dashboard/ProfileSettings';
import { 
    ShoppingBag, 
    Settings, 
    LogOut, 
    ChevronRight,
    Search
} from 'lucide-react';

/**
 * @component ClientDashboard
 * @description The main control center for Client users.
 * Allows clients to track their commission requests, manage account settings, and navigate to discovery features.
 * @returns {JSX.Element} The rendered Client Dashboard.
 */
const ClientDashboard = () => {
    const { user, loading: authLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    /** @description Dispatches logout action and redirects to login page. */
    const handleLogout = async () => {
        try {
            await logoutUser_api();
        } catch { /* silent */ }
        dispatch(logoutUser());
        navigate('/login');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-cocoa"></div>
            </div>
        );
    }

    if (!user || user.role !== 'client') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LogOut size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-deep-cocoa mb-2">Access Denied</h2>
                    <p className="text-muted-taupe mb-8">Please log in as a client to access your orders and settings.</p>
                    <Link to="/login">
                        <Button className="w-full">Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'orders', label: 'My Commissions', icon: ShoppingBag },
        { id: 'settings', label: 'Account Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#fdfaf7] flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-auto md:h-screen">
                <div className="p-8 border-b border-stone-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-deep-cocoa rounded-xl flex items-center justify-center text-white font-bold text-xl font-playfair shadow-lg shadow-stone-200">C</div>
                        <span className="text-xl font-playfair font-bold text-deep-cocoa tracking-tight">Client Hub</span>
                    </div>

                    <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 border border-stone-200 shadow-sm shrink-0">
                            <img 
                                src={user.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-deep-cocoa truncate text-sm">{user.fullName || user.username}</h3>
                            <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest leading-tight">Art Enthusiast</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition group ${
                                    isActive 
                                    ? 'bg-deep-cocoa text-white shadow-lg shadow-stone-200' 
                                    : 'text-muted-taupe hover:bg-stone-50 hover:text-deep-cocoa'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className={isActive ? 'text-white' : 'text-stone-400 group-hover:text-deep-cocoa'} />
                                    <span className="font-semibold text-sm">{tab.label}</span>
                                </div>
                                {isActive && <ChevronRight size={16} />}
                            </button>
                        );
                    })}

                    <div className="pt-6 mt-6 border-t border-stone-100">
                        <Link to="/discover" className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-deep-cocoa transition text-sm font-medium">
                            <Search size={18} />
                            Find New Artists
                        </Link>
                    </div>
                </nav>

                <div className="p-6 border-t border-stone-100">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition text-sm font-bold"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow">
                <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-5 sticky top-0 z-10 flex justify-between items-center sm:hidden md:flex">
                    <div className="flex items-center gap-2 text-stone-400">
                        <span className="text-sm font-medium capitalize">Client Dashboard</span>
                        <ChevronRight size={14} />
                        <span className="text-sm font-bold text-deep-cocoa capitalize">{activeTab === 'orders' ? 'My Commissions' : 'Settings'}</span>
                    </div>
                </header>

                <div className="p-8 md:p-12 max-w-6xl mx-auto">
                    {activeTab === 'orders' ? <ClientOrders /> : <ProfileSettings />}
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;
