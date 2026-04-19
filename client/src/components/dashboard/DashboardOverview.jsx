import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getArtistOrders, getArtistProfile } from '../../services/api';
import { 
    Clock, 
    CheckCircle2, 
    Wallet, 
    Star, 
    TrendingUp, 
    ArrowUpRight,
    Palette
} from 'lucide-react';

/**
 * @component DashboardOverview
 * @description Provides a high-level statistical summary for artists.
 * Displays key metrics like active projects, total earnings, and success rates.
 * @returns {JSX.Element} The rendered dashboard overview.
 */
const DashboardOverview = () => {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState({
        activeOrders: 0,
        completedOrders: 0,
        totalEarnings: 0,
        avgRating: 0,
        successRate: 0
    });
    const [loading, setLoading] = useState(true);

    /** @description Fetches and aggregates project statistics from multiple API endpoints. */
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, profileRes] = await Promise.all([
                    getArtistOrders(),
                    getArtistProfile(user._id).catch(() => null)
                ]);

                const orders = ordersRes.data.data || [];
                const profile = profileRes?.data?.data;

                const activeOrders = orders.filter(o => !['completed', 'rejected', 'cancelled'].includes(o.status)).length;
                const completedOrders = orders.filter(o => o.status === 'completed').length;
                const totalEarnings = orders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
                
                const totalAttempted = orders.filter(o => ['completed', 'rejected', 'cancelled'].includes(o.status)).length;
                const successRate = totalAttempted > 0 ? (completedOrders / totalAttempted) * 100 : 100;

                setStats({
                    activeOrders,
                    completedOrders,
                    totalEarnings: totalEarnings.toLocaleString('en-IN'),
                    avgRating: profile?.stats?.avgRating?.toFixed(1) || '0.0',
                    successRate: Math.round(successRate)
                });
            } catch (error) {
                console.error("Failed to load overview stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if(loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-10 w-64 bg-stone-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-stone-100 rounded-3xl border border-stone-100"></div>
                <div className="h-32 bg-stone-100 rounded-3xl border border-stone-100"></div>
                <div className="h-32 bg-stone-100 rounded-3xl border border-stone-100"></div>
            </div>
            <div className="h-64 bg-white rounded-3xl border border-stone-200"></div>
        </div>
    );

    /** 
     * @component StatCard
     * @private
     * @description Reusable presentational component for dashboard metrics.
     */
    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col justify-between group hover:border-deep-cocoa transition-colors">
            <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={24} className="text-current" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                        <TrendingUp size={12} /> {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-playfair font-black text-deep-cocoa">{value}</span>
                    <ArrowUpRight size={14} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 max-w-5xl">
            <div>
                <h2 className="text-3xl font-playfair font-bold text-deep-cocoa">
                    Good morning, {user.fullName?.split(' ')[0] || user.username}
                </h2>
                <p className="text-muted-taupe mt-1 text-sm">Here's what's happening with your studio today.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Active Projects" 
                    value={stats.activeOrders} 
                    icon={Clock} 
                    color="text-amber-600 bg-amber-500" 
                    trend="+2 new today"
                />
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${stats.totalEarnings}`} 
                    icon={Wallet} 
                    color="text-indigo-600 bg-indigo-500" 
                />
                <StatCard 
                    title="Artist Rating" 
                    value={stats.avgRating} 
                    icon={Star} 
                    color="text-amber-500 bg-amber-400" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-deep-cocoa uppercase tracking-tighter">Performance Insights</h3>
                        <span className="text-xs text-stone-400 font-medium">Last 30 Days</span>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-bold text-stone-500 uppercase">
                                <span>Completion Success Rate</span>
                                <span className="text-deep-cocoa">{stats.successRate}%</span>
                            </div>
                            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-deep-cocoa transition-all duration-1000" style={{ width: `${stats.successRate}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                                <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Total Finished</h4>
                                <p className="text-xl font-bold text-deep-cocoa">{stats.completedOrders}</p>
                            </div>
                            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                                <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Portfolio Items</h4>
                                <p className="text-xl font-bold text-deep-cocoa">{stats.completedOrders || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-deep-cocoa p-8 rounded-[2.5rem] shadow-xl shadow-stone-200 text-white flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <Palette size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">New Inspiration?</h3>
                        <p className="text-stone-300 text-sm leading-relaxed mb-6">
                            Showcase your latest work in your portfolio to increase your discovery rank.
                        </p>
                    </div>
                    <button className="w-full bg-white text-deep-cocoa font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all text-sm shadow-lg shadow-black/10">
                        Upload Artwork
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 border-dashed">
                <div className="flex items-center gap-3 text-muted-taupe">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-sm font-medium">Your account is fully verified and ready for commissions.</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
