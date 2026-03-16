import React, { useState, useEffect } from 'react';
import { getArtistOrders, updateOrderStatus } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const ArtistOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await getArtistOrders();
            setOrders(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update order status');
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
            <h2 className="text-2xl font-playfair mb-6">Commission Requests</h2>
            
            {loading ? (
                <p>Loading...</p>
            ) : orders.length === 0 ? (
                <p className="text-muted-taupe italic">No orders found.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="border border-stone-200 rounded-lg p-6 hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-stone-100 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                                    <p className="text-sm text-stone-500">Service: {order.serviceId?.title || 'Unknown'}</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="text-right">
                                        <div className="text-xs text-stone-400">Status</div>
                                        <div className={`px-3 py-1 rounded text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                                            {order.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-stone-400">Deadline</div>
                                        <div className="text-sm font-medium">{new Date(order.deadline).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-deep-cocoa mb-2">Requirements:</h4>
                                <div className="bg-stone-50 p-4 rounded text-sm text-stone-700 whitespace-pre-wrap">
                                    {order.requirements}
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-stone-100 pt-4">
                                {order.status === 'pending' && (
                                    <>
                                        <Button size="sm" onClick={() => handleUpdateStatus(order._id, 'accepted')}>Accept Order</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(order._id, 'rejected')}>Reject</Button>
                                    </>
                                )}
                                {order.status === 'accepted' && (
                                    <Button size="sm" onClick={() => handleUpdateStatus(order._id, 'in_progress')}>Start Working</Button>
                                )}
                                {order.status === 'in_progress' && (
                                    <Button size="sm" onClick={() => handleUpdateStatus(order._id, 'completed')}>Mark Completed</Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order._id}`)}>Open Thread</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArtistOrders;
