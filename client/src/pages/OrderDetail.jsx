import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
    getOrderById, 
    updateOrderStatus, 
    getOrderMessages, 
    sendMessage 
} from '../services/api';
import { Send, Clock, FileText, CheckCircle, AlertCircle, Landmark, Star, AlertTriangle } from 'lucide-react';
import { createCheckoutSession, submitReview, raiseDispute } from '../services/api';
import ReviewModal from '../components/ReviewModal';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    
    const [order, setOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [paying, setPaying] = useState(false);
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

    const handlePayment = async () => {
        setPaying(true);
        try {
            await createCheckoutSession(id);
            toast.success("Academic Payment Successful!");
            // Refresh order immediately since mock backend updates status automatically
            const orderRes = await getOrderById(id);
            setOrder(orderRes.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate mock payment');
        } finally {
            setPaying(false);
        }
    };

    const handleRaiseDispute = async () => {
        const reason = prompt("Enter the reason for dispute (e.g. Quality Issue, Late Delivery):");
        if (!reason) return;
        const explanation = prompt("Please provide a detailed explanation of the issue:");
        if (!explanation) return;

        try {
            await raiseDispute({
                orderId: id,
                reason,
                explanation
            });
            toast.success("Dispute raised. An admin will review it.");
            // Refresh
            const orderRes = await getOrderById(id);
            setOrder(orderRes.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to raise dispute');
        }
    };

    const handleDeliver = async (e) => {
        e.preventDefault();
        if (!deliverableUrl) return;
        setDeliverLoading(true);
        try {
            // Updated to use the new deliverableFiles array in the status update call
            await updateOrderStatus(id, 'Delivered', { deliverableFiles: [deliverableUrl] });
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
            case 'Requested': return 'bg-yellow-100 text-yellow-800';
            case 'Accepted': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-indigo-100 text-indigo-800';
            case 'Ready for Delivery': return 'bg-purple-100 text-purple-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Rejected': 
            case 'Cancelled': return 'bg-red-100 text-red-800';
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
                                
                                {isArtist && order.status === 'Requested' && (
                                    <div className="flex gap-2">
                                        <Button className="flex-1" onClick={() => handleUpdateStatus('Accepted')}>Accept</Button>
                                        <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus('Rejected')}>Reject</Button>
                                    </div>
                                )}

                                {isArtist && order.status === 'Accepted' && (
                                    <Button className="w-full" onClick={() => handleUpdateStatus('In Progress')}>Mark In Progress</Button>
                                )}

                                {isArtist && order.status === 'In Progress' && (
                                    <Button className="w-full" onClick={() => handleUpdateStatus('Ready for Delivery')}>Ready for Delivery</Button>
                                )}

                                {isArtist && order.status === 'Ready for Delivery' && (
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

                                {isClient && (order.status === 'Delivered' || order.status === 'Revision Requested') && (
                                    <div className="space-y-2">
                                        <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md" onClick={() => handleUpdateStatus('Completed')}>
                                            <CheckCircle className="w-4 h-4 mr-2 inline" /> Accept & Complete
                                        </Button>
                                        <Button variant="outline" className="w-full border-stone-300" onClick={() => handleUpdateStatus('Revision Requested')}>
                                            Request Revision
                                        </Button>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t border-stone-100">
                                    <button 
                                        onClick={handleRaiseDispute}
                                        className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition mx-auto"
                                    >
                                        <AlertTriangle className="w-3 h-3" /> Report a problem / Raise Dispute
                                    </button>
                                </div>

                                {isClient && order.status === 'Accepted' && (
                                    <Button 
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md" 
                                        onClick={handlePayment}
                                        disabled={paying}
                                    >
                                        <Landmark className="w-4 h-4 mr-2 inline" /> 
                                        {paying ? 'Processing...' : `Simulate $${order.serviceId?.basePrice?.toFixed(2)} Payment`}
                                    </Button>
                                )}

                                {isClient && order.status === 'Ready for Delivery' && (
                                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus('Completed')}>
                                        <CheckCircle className="w-4 h-4 mr-2 inline" /> Accept & Complete
                                    </Button>
                                )}

                                {(order.status === 'Completed' || order.status === 'Cancelled' || order.status === 'Rejected') && (
                                    <div className="text-center text-sm font-medium text-stone-500 py-2">
                                        No further actions available.
                                    </div>
                                )}
                            </div>

                            {/* Details List */}
                            <div className="space-y-4">
                                <div>
                                    <span className="flex items-center gap-2 text-sm font-bold text-deep-cocoa mb-1"><FileText className="w-4 h-4 text-stone-400"/> Requirements</span>
                                    <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100 whitespace-pre-wrap">
                                        {order.requirements}
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
                                    placeholder={order.status === 'Completed' ? "Order completed. Chat is closed." : "Type your message..."}
                                    disabled={order.status === 'Completed' || order.status === 'Cancelled' || order.status === 'Rejected'}
                                    className="flex-1 bg-stone-100 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-btn-brown focus:bg-white transition disabled:opacity-50"
                                />
                                <Button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending || order.status === 'Completed' || order.status === 'Cancelled' || order.status === 'Rejected'}
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
