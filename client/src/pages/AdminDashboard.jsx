import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api, { getAdminStats, getAdminUsers, deleteAdminUser, getAdminDisputes, resolveDispute } from '../services/api';
import { Users, Palette, ShoppingBag, Folder, Trash2, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../components/Button';

// Admin Sub-components
const AdminOverview = ({ stats }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-playfair font-bold text-text-brown">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-4 bg-btn-brown/10 text-btn-brown rounded-xl"><Users className="w-6 h-6" /></div>
                <div>
                    <div className="text-2xl font-bold text-text-brown">{stats?.totalUsers || 0}</div>
                    <div className="text-sm font-medium text-stone-500">Total Users</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-4 bg-orange-500/10 text-orange-600 rounded-xl"><Palette className="w-6 h-6" /></div>
                <div>
                    <div className="text-2xl font-bold text-text-brown">{stats?.artists || 0}</div>
                    <div className="text-sm font-medium text-stone-500">Registered Artists</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                <div>
                    <div className="text-2xl font-bold text-text-brown">{stats?.totalOrders || 0}</div>
                    <div className="text-sm font-medium text-stone-500">Total Orders</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-4 bg-green-500/10 text-green-600 rounded-xl"><Folder className="w-6 h-6" /></div>
                <div>
                    <div className="text-2xl font-bold text-text-brown">{stats?.totalCategories || 0}</div>
                    <div className="text-sm font-medium text-stone-500">Active Categories</div>
                </div>
            </div>
        </div>
    </div>
);

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await getAdminUsers();
            setUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, role) => {
        if (role === 'admin') {
            alert('Cannot delete admin users through this interface.');
            return;
        }

        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteAdminUser(userId);
                fetchUsers(); // Refresh list
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete user");
            }
        }
    };

    if (loading) return <div className="text-stone-500 animate-pulse">Loading users...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-text-brown mb-6">User Management</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-stone-200 text-sm font-medium text-stone-500">
                            <th className="pb-3 pl-2">Email</th>
                            <th className="pb-3">Role</th>
                            <th className="pb-3">Joined</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {users.map((u) => (
                            <tr key={u._id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                                <td className="py-4 pl-2 font-medium text-text-brown">{u.email}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold leading-none ${
                                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                        u.role === 'artist' ? 'bg-blue-100 text-blue-700' :
                                        'bg-stone-100 text-stone-600'
                                    }`}>
                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                    </span>
                                </td>
                                <td className="py-4 text-stone-500">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 text-right pr-2">
                                    {u.role !== 'admin' ? (
                                        <button 
                                            onClick={() => handleDelete(u._id, u.role)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <ShieldAlert className="w-4 h-4 inline-block text-stone-400 mr-2" title="Protected Admin" />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="text-center py-8 text-stone-500">No users found.</div>}
            </div>
        </div>
    );
};

const DisputeManagement = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDisputes = async () => {
        try {
            const res = await getAdminDisputes();
            setDisputes(res.data.data);
        } catch (error) {
            console.error("Failed to fetch disputes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (id) => {
        const resolution = prompt("Enter resolution details (e.g. Refund issued, Order cancelled, Escrow released):");
        if (!resolution) return;
        
        try {
            await resolveDispute(id, { status: "Resolved", resolution });
            fetchDisputes();
        } catch (error) {
            alert("Failed to resolve dispute");
        }
    };

    if (loading) return <div className="text-stone-500 animate-pulse">Loading disputes...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-text-brown mb-6">Dispute Moderation</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-stone-200 text-sm font-medium text-stone-500">
                            <th className="pb-3 pl-2">Order ID</th>
                            <th className="pb-3">Raised By</th>
                            <th className="pb-3">Reason</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {disputes.map((d) => (
                            <tr key={d._id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                                <td className="py-4 pl-2 font-mono text-xs text-stone-500">#{d.orderId?._id?.slice(-8)}</td>
                                <td className="py-4">{d.raisedBy?.email}</td>
                                <td className="py-4 font-medium text-red-600">{d.reason}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                        d.status === 'Open' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {d.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    {d.status === 'Open' && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleResolve(d._id)}
                                            className="text-xs py-1"
                                        >
                                            Resolve
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {disputes.length === 0 && <div className="text-center py-8 text-stone-500">No active disputes.</div>}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user, loading } = useSelector(state => state.auth);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getAdminStats();
                setStats(res.data.data);
            } catch (error) {
                console.error("Failed to load admin stats");
            }
        };
        if (user?.role === 'admin') {
            fetchStats();
        }
    }, [user]);

    if (loading || !user) return null; // Or a loading spinner

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Folder className="w-4 h-4" /> },
        { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
        { id: 'disputes', label: 'Disputes', icon: <AlertTriangle className="w-4 h-4" /> },
    ];

    return (
        <div className="bg-stone-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-playfair font-bold text-text-brown mb-2">Admin Control Panel</h1>
                    <p className="text-stone-500 font-medium">Manage platform users, view system metrics, and oversee categories.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* Sidebar Nav */}
                    <div className="md:col-span-1 border-r border-stone-200 pr-4">
                        <nav className="space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                        activeTab === tab.id 
                                            ? 'bg-btn-brown text-white shadow-sm' 
                                            : 'text-stone-600 hover:bg-stone-200/50 hover:text-text-brown'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        
                        <div className="mt-8 p-4 bg-bg-cream rounded-xl border border-warm-stone/30">
                            <div className="flex items-center gap-2 text-text-brown font-bold text-sm mb-1">
                                <ShieldAlert className="w-4 h-4 text-orange-600" />
                                Admin Privileges
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                You have full access to system metrics. Exercise caution when deleting user accounts.
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-3">
                        {activeTab === 'overview' && <AdminOverview stats={stats} />}
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'disputes' && <DisputeManagement />}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
