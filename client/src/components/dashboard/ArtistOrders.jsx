import React, { useState, useEffect } from 'react';
import { getArtistOrders, updateOrderStatus } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { Clock, CheckCircle2,  AlertCircle,  MessageSquare, Calendar} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @component ArtistOrders
 * @description Manages the list of incoming commissions for artists.
 * Allows artists to accept, decline, and advance order statuses.
 * @returns {JSX.Element} The rendered Artist Orders view.
 */
const ArtistOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    /** @description Fetches the current list of artist-specific orders from the server. */
    const fetchOrders = async () => {
        try {
            const res = await getArtistOrders();
            setOrders(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load commissions");
        } finally {
            setLoading(false);
        }
    };

    /** @description Updates the status of a specific order and triggers a re-fetch. */
    const handleUpdateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            toast.success(`Order marked as ${status.replace('_', ' ')}`);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    /** 
     * @component StatusBadge
     * @private
     * @description semantic badge for tracking order workflow states.
     */
    const StatusBadge = ({ status }) => {
        const config = {
            pending: { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock, label: 'Pending Request' },
            awaiting_price: { color: 'text-purple-700 bg-purple-50 border-purple-100', icon: AlertCircle, label: 'Needs Quote' },
            price_quoted: { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: Clock, label: 'Price Quoted' },
            accepted: { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Ready to Start' },
            in_progress: { color: 'text-indigo-700 bg-indigo-50 border-indigo-100', icon: Clock, label: 'Work in Progress' },
            completed: { color: 'text-stone-700 bg-stone-50 border-stone-200', icon: CheckCircle2, label: 'Finished' },
            rejected: { color: 'text-red-700 bg-red-50 border-red-100', icon: AlertCircle, label: 'Declined' },
            cancelled: { color: 'text-stone-400 bg-stone-50 border-stone-100', icon: AlertCircle, label: 'Cancelled' },
        };

        const { color, icon: Icon, label } = config[status] || config.pending;

        return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color}`}>
                <Icon size={12} />
                {label}
            </div>
        );
    };

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="h-64 bg-white rounded-[2rem] border border-stone-100 shadow-sm"></div>
            <div className="h-64 bg-white rounded-[2rem] border border-stone-100 shadow-sm"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-playfair font-bold text-deep-cocoa">Manage Commissions</h2>
                <div className="text-sm text-stone-400 font-medium">{orders.length} Active Requests</div>
            </div>
            
            {orders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
                    <h3 className="text-xl font-bold text-deep-cocoa font-playfair">No commission requests yet</h3>
                    <p className="text-muted-taupe mt-1 text-sm">When clients request custom work, they'll appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:border-deep-cocoa transition-colors group">
                            <div className="p-8 pb-6 border-b border-stone-100">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold font-playfair text-deep-cocoa group-hover:underline">
                                                {order.title || 'Untitled Commission'}
                                            </h3>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-stone-400 font-medium">Order ID: {order._id.toUpperCase()}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-2xl border border-stone-100">
                                            <div className="w-8 h-8 rounded-lg bg-stone-200 overflow-hidden border border-stone-200">
                                                <img src={order.clientId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${order.clientId?.email}`} alt="Client" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Request from</div>
                                                <div className="text-xs font-bold text-deep-cocoa">{order.clientId?.fullName || order.clientId?.username}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Deadline</div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-deep-cocoa">
                                                <Calendar size={12} className="text-stone-400" />
                                                {new Date(order.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-8 py-6 bg-stone-50/30 flex-grow">
                                <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-3">Project Brief</h4>
                                <div className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                                    {order.description}
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-white flex items-center justify-between border-t border-stone-100">
                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleUpdateStatus(order._id, 'accepted')}
                                                className="bg-deep-cocoa text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-stone-200 hover:opacity-90 transition"
                                            >
                                                Accept Request
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(order._id, 'rejected')}
                                                className="bg-white text-red-500 border border-red-100 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'accepted' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order._id, 'in_progress')}
                                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:opacity-90 transition"
                                        >
                                            Begin Production
                                        </button>
                                    )}
                                    {order.status === 'in_progress' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order._id, 'completed')}
                                            className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-green-100 hover:opacity-90 transition"
                                        >
                                            Approve & Finalize
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="flex items-center gap-2 text-deep-cocoa px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-50 transition"
                                    >
                                        <MessageSquare size={16} />
                                        Discussion Thread
                                    </button>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Est. Quote</span>
                                    <span className="text-lg font-black text-deep-cocoa font-playfair">₹{order.price || 500}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArtistOrders;
