import React, { useState, useEffect } from 'react';
import { getClientOrders } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const ClientOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await getClientOrders();
            setOrders(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h2 className="text-2xl font-playfair mb-6">My Commissions</h2>
            
            {loading ? (
                <p>Loading...</p>
            ) : orders.length === 0 ? (
                <p className="text-muted-taupe italic">You haven't requested any commissions yet.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-stone-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 text-muted-taupe text-sm">
                                <th className="p-4 font-medium border-b border-stone-200">Order ID</th>
                                <th className="p-4 font-medium border-b border-stone-200">Service</th>
                                <th className="p-4 font-medium border-b border-stone-200">Deadline</th>
                                <th className="p-4 font-medium border-b border-stone-200">Status</th>
                                <th className="p-4 font-medium border-b border-stone-200">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-stone-50/50 transition">
                                    <td className="p-4 border-b border-stone-100 font-mono text-xs">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                                    <td className="p-4 border-b border-stone-100 text-sm font-medium">{order.serviceId?.title || 'Unknown Service'}</td>
                                    <td className="p-4 border-b border-stone-100 text-sm">{new Date(order.deadline).toLocaleDateString()}</td>
                                    <td className="p-4 border-b border-stone-100">
                                        <span className={`px-2 py-1 flex items-center justify-center w-24 text-center rounded text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b border-stone-100">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                        >
                                            View Thread
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClientOrders;
