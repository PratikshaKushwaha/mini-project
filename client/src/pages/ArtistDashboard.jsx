import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ProfileSettings from '../components/dashboard/ProfileSettings';
import PortfolioManager from '../components/dashboard/PortfolioManager';
import ArtistOrders from '../components/dashboard/ArtistOrders';

const ArtistDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    if (!user || user.role !== 'artist') {
        return <div className="p-8 text-center mt-12 text-red-600 bg-red-50 rounded-lg max-w-xl mx-auto border border-red-100">Unauthorized access. Please log in as an artist.</div>;
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'overview': return <DashboardOverview />;
            case 'portfolio': return <PortfolioManager />;
            case 'orders': return <ArtistOrders />;
            case 'settings': return <ProfileSettings />;
            default: return <DashboardOverview />;
        }
    };

    const navItemClass = (tab) => 
        `p-4 rounded-lg shadow-sm border cursor-pointer transition font-medium ${
            activeTab === tab 
            ? 'bg-stone-50 border-stone-300 border-l-4 border-l-deep-cocoa text-deep-cocoa' 
            : 'bg-white border-stone-200 hover:bg-stone-50 text-muted-taupe'
        }`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <h1 className="text-3xl font-playfair font-bold text-deep-cocoa tracking-tight">Artist Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-3">
                    <div className={navItemClass('overview')} onClick={() => setActiveTab('overview')}>Overview</div>
                    <div className={navItemClass('orders')} onClick={() => setActiveTab('orders')}>Commission Orders</div>
                    <div className={navItemClass('portfolio')} onClick={() => setActiveTab('portfolio')}>Portfolio Manager</div>
                    <div className={navItemClass('settings')} onClick={() => setActiveTab('settings')}>Profile Settings</div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ArtistDashboard;
