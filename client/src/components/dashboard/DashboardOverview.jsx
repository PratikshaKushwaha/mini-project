import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getArtistOrders, getServices } from '../../services/api';

const DashboardOverview = () => {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState({
        activeOrders: 0,
        completedOrders: 0,
        activeServices: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, servicesRes] = await Promise.all([
                    getArtistOrders(),
                    getServices(user._id)
                ]);

                const orders = ordersRes.data.data;
                const services = servicesRes.data.data;

                const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'rejected').length;
                const completedOrders = orders.filter(o => o.status === 'completed').length;

                setStats({
                    activeOrders,
                    completedOrders,
                    activeServices: services.length
                });
            } catch (error) {
                console.error("Failed to load overview stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if(loading) return <div className="p-6 bg-white rounded-lg shadow-sm border border-stone-200 min-h-[500px]">Loading overview...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 min-h-[500px]">
            <h2 className="text-2xl font-playfair mb-6">Welcome back, {user.email.split('@')[0]}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-stone-50 rounded-lg border border-stone-200 text-center">
                    <div className="text-4xl font-bold text-deep-cocoa mb-2">{stats.activeOrders}</div>
                    <div className="text-xs text-muted-taupe uppercase tracking-widest font-bold">Active Orders</div>
                </div>
                <div className="p-6 bg-stone-50 rounded-lg border border-stone-200 text-center">
                    <div className="text-4xl font-bold text-deep-cocoa mb-2">{stats.completedOrders}</div>
                    <div className="text-xs text-muted-taupe uppercase tracking-widest font-bold">Completed</div>
                </div>
                <div className="p-6 bg-stone-50 rounded-lg border border-stone-200 text-center">
                    <div className="text-4xl font-bold text-deep-cocoa mb-2">{stats.activeServices}</div>
                    <div className="text-xs text-muted-taupe uppercase tracking-widest font-bold">Services</div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold font-inter mb-4 border-b pb-2">Recent Activity</h3>
                <p className="text-muted-taupe text-sm italic bg-stone-50 px-4 py-3 border border-stone-200 rounded">
                    Metrics loaded dynamically from your account. 
                    Switch tabs to manage your portfolio, create services, or accept incoming requests!
                </p>
            </div>
        </div>
    );
};

export default DashboardOverview;
