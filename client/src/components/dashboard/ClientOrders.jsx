import React, { useState, useEffect } from 'react';
import { getClientOrders, updateOrderStatus } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    MessageSquare, 
    Calendar,
    CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @component ClientOrders
 * @description Displays a list of commissions placed by the current client.
 * Allows clients to track progress, confirm quotes, and cancel requests.
 * @returns {JSX.Element} The rendered Client Orders view.
 */
const ClientOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    /** @description Fetches all commissions associated with the current client account. */
    const fetchOrders = async () => {
        try {
            const res = await getClientOrders();
            setOrders(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your commissions");
        } finally {
            setLoading(false);
        }
    };

    /** @description Handles client-side state transitions (Confirm/Cancel). */
    const handleUpdateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            toast.success(status === 'cancelled' ? "Order cancelled" : "Action successful");
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order');
        }
    };

    /** 
     * @component StatusBadge
     * @private
     * @description Semantic badge for tracking commission milestones.
     */
    const StatusBadge = ({ status }) => {
        const config = {
            pending: { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock, label: 'Waiting for Artist' },
            awaiting_price: { color: 'text-purple-700 bg-purple-50 border-purple-100', icon: AlertCircle, label: 'Artist estimating' },
            price_quoted: { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: CreditCard, label: 'Price Quoted' },
            accepted: { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Artist is Ready' },
            in_progress: { color: 'text-indigo-700 bg-indigo-50 border-indigo-100', icon: Clock, label: 'In Production' },
            completed: { color: 'text-stone-700 bg-stone-50 border-stone-200', icon: CheckCircle2, label: 'Done & Delivered' },
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
                <h2 className="text-2xl font-playfair font-bold text-deep-cocoa">My Commissions</h2>
                <div className="text-sm text-stone-400 font-medium tracking-tight">{orders.length} Active Orders</div>
            </div>
            
            {orders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
                    <h3 className="text-xl font-bold text-deep-cocoa font-playfair">Your art journey starts here</h3>
                    <p className="text-muted-taupe mt-1 text-sm">You haven't requested any custom commissions yet.</p>
                    <button 
                        onClick={() => navigate('/discover')}
                        className="mt-6 text-deep-cocoa font-bold text-sm underline hover:opacity-80 transition"
                    >
                        Browse Artists
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:border-deep-cocoa transition-colors group">
                            <div className="p-8 pb-6 border-b border-stone-100">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold font-playfair text-deep-cocoa group-hover:underline">
                                                {order.title || 'Custom Requirement'}
                                            </h3>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-stone-400 font-medium">Order ID: #{order._id.substring(order._id.length-8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-2xl border border-stone-100">
                                            <div className="w-8 h-8 rounded-lg bg-stone-200 overflow-hidden border border-stone-200">
                                                <img 
                                                    src={order.artistId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${order.artistId?.email}`} 
                                                    alt="Artist" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Artist</div>
                                                <div className="text-xs font-bold text-deep-cocoa leading-tight">{order.artistId?.fullName || order.artistId?.username}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Est. Delivery</div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-deep-cocoa">
                                                <Calendar size={12} className="text-stone-400" />
                                                {new Date(order.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-8 py-6 bg-stone-50/30">
                                <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                                    {order.description}
                                </p>
                            </div>

                            <div className="px-8 py-6 bg-white flex items-center justify-between border-t border-stone-100">
                                <div className="flex gap-2">
                                    {order.status === 'price_quoted' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order._id, 'accepted')}
                                            className="bg-deep-cocoa text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-stone-200 hover:opacity-90 transition"
                                        >
                                            Confirm Price
                                        </button>
                                    )}
                                    {['pending', 'price_quoted', 'awaiting_price'].includes(order.status) && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                            className="bg-white text-red-500 border border-stone-100 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="flex items-center gap-2 text-deep-cocoa px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-50 transition"
                                    >
                                        <MessageSquare size={16} />
                                        Case Conversation
                                    </button>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Final Price</span>
                                    <span className="text-lg font-black text-deep-cocoa font-playfair">₹{order.price || 'Pending'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientOrders;
