import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
    getOrderById, 
    updateOrderStatus, 
    getOrderMessages, 
    sendMessage 
} from '../../services/api';
import { Send, Clock, FileText, CheckCircle, AlertCircle, Star, AlertTriangle, List } from 'lucide-react';
import { submitReview } from '../../services/api';
import ReviewModal from '../../components/ReviewModal';
import toast from 'react-hot-toast';
import Button from '../../components/Button';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    
    const [order, setOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [deliverableUrl, setDeliverableUrl] = useState("");
    const [deliverLoading, setDeliverLoading] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    const messagesEndRef = useRef(null);

    const fetchOrderAndMessages = async () => {
        try {
            const [orderRes, msgsRes] = await Promise.all([
                getOrderById(id),
                getOrderMessages(id)
            ]);
            setOrder(orderRes.data.data);
            setMessages(msgsRes.data.data);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 403 || error.response?.status === 404) {
               navigate('/'); // Redirect if unauthorized or not found
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderAndMessages();
        // Optional: Implement simple polling for MVP if websockets aren't setup
        const interval = setInterval(() => {
            getOrderMessages(id).then(res => setMessages(res.data.data)).catch(console.error);
        }, 10000);
        
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        // Auto scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await sendMessage(id, { message: newMessage });
            setNewMessage("");
            // Refresh messages
            const msgsRes = await getOrderMessages(id);
            setMessages(msgsRes.data.data);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            // Refresh order
            const orderRes = await getOrderById(id);
            setOrder(orderRes.data.data);

            if (newStatus === 'Completed' && isClient) {
                setIsReviewModalOpen(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await submitReview({
                orderId: id,
                ...reviewData
            });
            setIsReviewModalOpen(false);
            alert("Thank you for your review!");
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleDeliver = async (e) => {
        e.preventDefault();
        if (!deliverableUrl) return;
        setDeliverLoading(true);
        try {
            // Updated to use the new deliverableFiles array in the status update call
            await updateOrderStatus(id, 'completed', { deliverableFiles: [deliverableUrl] });
            toast.success("Work delivered successfully!");
            const orderRes = await getOrderById(id);
            setOrder(orderRes.data.data);
            setDeliverableUrl("");
        } catch (error) {
            toast.error("Failed to deliver work");
        } finally {
            setDeliverLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-muted-taupe">Loading order details...</div>;
    if (!order) return null;

    const isClient = user?._id === order.clientId._id;
    const isArtist = user?._id === order.artistId._id;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-indigo-100 text-indigo-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'rejected': 
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-stone-100 text-stone-800';
        }
    };

    return (
        <div className="bg-stone-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-text-brown mb-6 flex items-center gap-1 font-medium transition">
                    ← Back to Dashboard
                </button>

                <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)] min-h-[600px]">
                    
                    {/* Left Pane: Order Details */}
                    <div className="lg:w-1/3 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
                        <div className="bg-text-brown p-6 text-white shrink-0">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-playfair font-bold">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h2>
                                    <p className="text-stone-300 text-sm">{order.serviceId?.title || 'Custom Service'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="text-3xl font-bold">${order.serviceId?.basePrice?.toFixed(2) || '0.00'}</div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            
                            {/* Actions based on role and status */}
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-3">
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Available Actions</h3>
                                
                                {isArtist && order.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button className="flex-1" onClick={() => handleUpdateStatus('accepted')}>Accept</Button>
                                        <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus('rejected')}>Reject</Button>
                                    </div>
                                )}

                                {isArtist && order.status === 'accepted' && (
                                    <Button className="w-full" onClick={() => handleUpdateStatus('in_progress')}>Mark In Progress</Button>
                                )}

                                {isArtist && order.status === 'in_progress' && (
                                    <form onSubmit={handleDeliver} className="space-y-3 pt-2">
                                        <div className="text-xs font-bold text-stone-500 mb-1">FINAL DELIVERABLE URL</div>
                                        <input 
                                            type="url" 
                                            placeholder="Paste high-res link (Google Drive, Dropbox, Cloudinary)" 
                                            value={deliverableUrl}
                                            onChange={(e) => setDeliverableUrl(e.target.value)}
                                            required
                                            className="w-full text-sm p-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-btn-brown"
                                        />
                                        <Button type="submit" className="w-full bg-btn-brown shadow-md" disabled={deliverLoading}>
                                            {deliverLoading ? 'Delivering...' : 'Submit Final Delivery'}
                                        </Button>
                                    </form>
                                )}

                                {isClient && order.status === 'in_progress' && (
                                    <div className="space-y-2">
                                        <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md" onClick={() => handleUpdateStatus('completed')}>
                                            <CheckCircle className="w-4 h-4 mr-2 inline" /> Finish & Accept
                                        </Button>
                                    </div>
                                )}
                                
                                {isClient && order.status === 'pending' && (
                                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus('cancelled')}>
                                        Cancel Request
                                    </Button>
                                )}

                                {(order.status === 'completed' || order.status === 'cancelled' || order.status === 'rejected') && (
                                    <div className="text-center text-sm font-medium text-stone-500 py-2">
                                        No further actions available.
                                    </div>
                                )}
                            </div>

                            {/* Details List */}
                            <div className="space-y-4">
                                
                                {order.statusHistory && order.statusHistory.length > 0 && (
                                    <div className="mb-6">
                                        <span className="flex items-center gap-2 text-sm font-bold text-deep-cocoa mb-4"><List className="w-4 h-4 text-stone-400"/> Order Journey</span>
                                        <div className="relative border-l-2 border-stone-200 ml-3 space-y-6">
                                            {order.statusHistory.map((historyItem, idx) => (
                                                <div key={idx} className="relative pl-6">
                                                    <div className="absolute w-3 h-3 bg-btn-brown rounded-full mt-1.5 -left-[7px] border-2 border-white"></div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold uppercase tracking-wide inline-block w-max px-2 py-0.5 rounded ${getStatusColor(historyItem.status)} mb-1`}>
                                                            {historyItem.status.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-stone-500">
                                                            {new Date(historyItem.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="border-t border-stone-100 pt-4">
                                    <span className="flex items-center gap-2 text-sm font-bold text-deep-cocoa mb-1"><FileText className="w-4 h-4 text-stone-400"/> Title & Description</span>
                                    <p className="text-sm font-medium text-stone-800 mb-1">{order.title}</p>
                                    <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100 whitespace-pre-wrap">
                                        {order.description}
                                    </p>
                                </div>

                                {order.deliverableFiles && order.deliverableFiles.length > 0 && (
                                    <div className="bg-btn-brown/5 p-4 rounded-xl border border-btn-brown/10">
                                        <span className="flex items-center gap-2 text-sm font-bold text-deep-cocoa mb-2 text-btn-brown">
                                            <CheckCircle className="w-4 h-4"/> WORK DELIVERED
                                        </span>
                                        <div className="space-y-2">
                                            {order.deliverableFiles.map((file, idx) => (
                                                <a 
                                                    key={idx} 
                                                    href={file} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-deep-cocoa hover:underline font-medium"
                                                >
                                                    <FileText className="w-4 h-4" /> Download Artwork #{idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {order.deadline && (
                                    <div>
                                        <span className="flex items-center gap-2 text-sm font-bold text-deep-cocoa mb-1"><Clock className="w-4 h-4 text-stone-400"/> Deadline</span>
                                        <p className="text-sm text-stone-600">{new Date(order.deadline).toLocaleDateString()}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="flex items-center gap-2 text-sm font-bold text-deep-cocoa mb-1">Participants</span>
                                    <div className="text-sm text-stone-600">
                                        <span className="font-medium text-text-brown">Client:</span> {order.clientId?.email} <br/>
                                        <span className="font-medium text-text-brown">Artist:</span> {order.artistId?.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Chat Interface */}
                    <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
                        
                        {/* Chat Header */}
                        <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold text-deep-cocoa">Project Chat</h3>
                                <p className="text-xs text-stone-500">
                                    Discuss details with {isClient ? 'the artist' : 'your client'}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-btn-brown/10 flex items-center justify-center text-btn-brown">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-6 overflow-y-auto bg-stone-50/30 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-stone-400 italic text-sm">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMine = msg.senderId?._id === user?._id;
                                    return (
                                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                                                isMine 
                                                ? 'bg-text-brown text-white rounded-br-sm' 
                                                : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
                                            }`}>
                                                {!isMine && (
                                                    <div className="text-xs font-bold mb-1 opacity-50">
                                                        {msg.senderId?.email?.split('@')[0]}
                                                    </div>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                <div className={`text-[10px] mt-2 text-right ${isMine ? 'text-stone-300' : 'text-stone-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={order.status === 'completed' ? "Order completed. Chat is closed." : "Type your message..."}
                                    disabled={order.status === 'completed' || order.status === 'cancelled' || order.status === 'rejected'}
                                    className="flex-1 bg-stone-100 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-btn-brown focus:bg-white transition disabled:opacity-50"
                                />
                                <Button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending || order.status === 'completed' || order.status === 'cancelled' || order.status === 'rejected'}
                                    className="rounded-full w-12 h-12 p-0 flex items-center justify-center shrink-0"
                                >
                                    <Send className="w-5 h-5 ml-[-2px]" />
                                </Button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            
            <ReviewModal 
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
                artistName={order?.artistId?.email?.split('@')[0] || "the artist"}
            />
        </div>
    );
};

export default OrderDetail;
