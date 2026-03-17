import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import ClientOrders from '../../components/dashboard/ClientOrders';
import { updateProfile } from '../../services/api';
import toast from 'react-hot-toast';
import { setCredentials } from '../../store/authSlice';

const ClientSettings = ({ user }) => {
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateProfile({ fullName });
            dispatch(setCredentials({
                user: res.data.data,
                accessToken: localStorage.getItem('accessToken')
            }));
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 min-h-[500px]">
            <h2 className="text-2xl font-playfair mb-6">Account Settings</h2>
            
            <form onSubmit={handleSubmit} className="max-w-md space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-text-brown mb-2">Email (Read Only)</label>
                    <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="w-full p-3 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-brown mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-btn-brown outline-none transition"
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </div>
    );
};

const ClientDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    if (!user || user.role !== 'client') {
        return <div className="p-8 text-center mt-12 text-red-600 bg-red-50 rounded-lg max-w-xl mx-auto border border-red-100">Unauthorized access. Please log in as a client.</div>;
    }

    const navItemClass = (tab) => 
        `p-4 rounded-lg shadow-sm border cursor-pointer transition font-medium ${
            activeTab === tab 
            ? 'bg-stone-50 border-stone-300 border-l-4 border-l-deep-cocoa text-deep-cocoa' 
            : 'bg-white border-stone-200 hover:bg-stone-50 text-muted-taupe'
        }`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <h1 className="text-3xl font-playfair font-bold text-deep-cocoa tracking-tight">Client Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-3">
                    <div className={navItemClass('orders')} onClick={() => setActiveTab('orders')}>My Orders</div>
                    <div className={navItemClass('settings')} onClick={() => setActiveTab('settings')}>Account Settings</div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'orders' ? <ClientOrders /> : <ClientSettings user={user} />}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
