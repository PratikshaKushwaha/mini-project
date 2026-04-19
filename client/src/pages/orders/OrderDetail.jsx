import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
    getOrderById, 
    updateOrderStatus, 
    getOrderMessages, 
    sendMessage,
    submitReview
} from '../../services/api';
import { 
    Send, 
    Clock, 
    FileText, 
    CheckCircle2, 
    Star, 
    Paperclip,
    ChevronLeft,
    Download,
    MoreVertical,
    MessageSquare,
    User,
    Calendar
} from 'lucide-react';
import ReviewModal from '../../components/ReviewModal';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import { io } from 'socket.io-client';

/**
 * @component OrderDetail
 * @description The comprehensive view for a single commission order.
 * Manages the transition of order states, real-time messaging, and final asset delivery.
 * Serves both Artist and Client roles with context-aware action triggers.
 * @returns {JSX.Element} The rendered Order Detail page.
 */
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

    /** @description Synchronizes the component with the latest order state and project thread. */
    const fetchOrderAndMessages = async () => {
        try {
            const [orderRes, msgsRes] = await Promise.all([
                getOrderById(id),
                getOrderMessages(id)
            ]);
            setOrder(orderRes.data.data);
            setMessages(msgsRes.data.data || []);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 403 || error.response?.status === 404) {
               navigate('/discover');
            }
        } finally {
            setLoading(false);
        }
    };

    /** @description Initializes socket for real-time discussion thread updates. */
    useEffect(() => {
        fetchOrderAndMessages();
        
        const ENDPOINT = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const socket = io(ENDPOINT, { withCredentials: true });

        socket.emit("joinOrder", id);

        socket.on("receive_message", (newMsg) => {
            setMessages((prev) => {
                if (prev.find(m => m._id === newMsg._id)) return prev;
                return [...prev, newMsg];
            });
        });
        
        return () => {
            socket.disconnect();
        };
    }, [id]);

    /** @description Auto-scrolls to the latest message in the thread. */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /** @description Publishes a new message to the project discussion thread. */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await sendMessage(id, { message: newMessage });
            setNewMessage("");
            // Removed redundant getOrderMessages fetch since Socket.IO handles the update
        } catch (error) {
            toast.error("Message delivery failed");
        } finally {
            setSending(false);
        }
    };

    /** 
     * @description Advances the order lifecycle.
     * Triggers the review modal upon successful completion for clients.
     */
    const handleUpdateStatus = async (newStatus, data = {}) => {
        try {
            await updateOrderStatus(id, newStatus, data);
            toast.success(`Success: ${newStatus.replace('_', ' ')}`);
            await fetchOrderAndMessages();

            if (newStatus === 'completed' && isClient) {
                setIsReviewModalOpen(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    /** @description Finishes the order and publishes user review to artist profile. */
    const handleSubmitReview = async (reviewData) => {
        try {
            await submitReview({
                orderId: id,
                ...reviewData
            });
            setIsReviewModalOpen(false);
            toast.success("Review published!");
            fetchOrderAndMessages();
        } catch (error) {
            toast.error('Review submission failed');
        }
    };

    /** @description Handles the high-stakes final delivery of assets by the artist. */
    const handleDeliver = async (e) => {
        e.preventDefault();
        if (!deliverableUrl) return;
        setDeliverLoading(true);
        try {
            await handleUpdateStatus('completed', { deliverableFiles: [deliverableUrl] });
            setDeliverableUrl("");
        } finally {
            setDeliverLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-stone-50 animate-pulse p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="h-12 w-48 bg-stone-200 rounded-2xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm"></div>
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm"></div>
                </div>
            </div>
        </div>
    );
    
    if (!order) return null;

    const isClient = user?._id === (order.clientId?._id || order.clientId);
    const isArtist = user?._id === (order.artistId?._id || order.artistId);

    const statusSteps = [
        { id: 'pending', label: 'Requested' },
        { id: 'accepted', label: 'Approved' },
        { id: 'in_progress', label: 'Processing' },
        { id: 'completed', label: 'Delivered' }
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);
    const isFailed = ['rejected', 'cancelled'].includes(order.status);

    /** @description Returns semantic visual classes based on order state. */
    const getStatusTheme = (status) => {
        const theme = {
            pending: 'text-amber-700 bg-amber-50 border-amber-100',
            accepted: 'text-emerald-700 bg-emerald-50 border-emerald-100',
            in_progress: 'text-indigo-700 bg-indigo-50 border-indigo-100',
            completed: 'text-stone-700 bg-stone-50 border-stone-200',
            rejected: 'text-red-700 bg-red-50 border-red-100',
            cancelled: 'text-stone-400 bg-stone-50 border-stone-100',
        };
        return theme[status] || theme.pending;
    };

    return (
        <div className="bg-[#fdfaf7] min-h-screen">
            {/* Header / Sub-Nav */}
            <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 group text-stone-500 hover:text-deep-cocoa transition font-bold text-sm">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-deep-cocoa group-hover:text-white transition">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Portal
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusTheme(order.status)}`}>
                            {order.status.replace('_', ' ')}
                        </div>
                        <MoreVertical size={20} className="text-stone-300" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Visual Status Tracker */}
                {!isFailed && (
                   <div className="bg-white rounded-[2rem] border border-stone-200 p-8 mb-8 shadow-sm">
                       <div className="flex justify-between relative max-w-4xl mx-auto">
                           {/* Tracker Line */}
                           <div className="absolute top-5 left-0 w-full h-0.5 bg-stone-100 -z-10"></div>
                           <div 
                               className="absolute top-5 left-0 h-0.5 bg-deep-cocoa transition-all duration-1000 -z-10" 
                               style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                           ></div>

                           {statusSteps.map((step, idx) => {
                               const isActive = idx <= currentStepIndex;
                               return (
                                   <div key={step.id} className="flex flex-col items-center gap-3">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all ${
                                           isActive ? 'bg-deep-cocoa text-white' : 'bg-stone-100 text-stone-300'
                                       }`}>
                                           {isActive ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                                       </div>
                                       <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-deep-cocoa' : 'text-stone-300'}`}>
                                           {step.label}
                                       </span>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[700px] items-stretch">
                    
                    {/* Left: Project Sidebar */}
                    <div className="lg:w-[380px] flex flex-col gap-6 shrink-0">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 bg-deep-cocoa text-white">
                                <h2 className="text-2xl font-playfair font-bold mb-1 truncate">{order.title}</h2>
                                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Case ID: {order._id.toUpperCase()}</p>
                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-sm opacity-60">Revenue:</span>
                                    <span className="text-3xl font-black font-playfair">₹{order.price || '0'}</span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto space-y-8">
                                {/* Roles */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cat-cream flex items-center justify-center text-text-brown">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Client Contact</div>
                                                <div className="text-sm font-bold text-deep-cocoa truncate">{order.clientId?.fullName || order.clientId?.username}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-deep-cocoa">
                                                <Star size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Artist Primary</div>
                                                <div className="text-sm font-bold text-deep-cocoa truncate">{order.artistId?.fullName || order.artistId?.username}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="space-y-6 pt-4 border-t border-stone-100">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 tracking-widest mb-3">
                                            <Calendar size={14}/> Deadline
                                        </h4>
                                        <p className="text-sm font-bold text-deep-cocoa">
                                            {new Date(order.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 tracking-widest mb-3">
                                            <FileText size={14}/> Requirements
                                        </h4>
                                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-sm text-stone-600 leading-relaxed max-h-48 overflow-y-auto scrollbar-hide">
                                            {order.description}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-2">
                                        {isArtist && order.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateStatus('accepted')} className="flex-1 bg-deep-cocoa text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-stone-200">Approve</button>
                                                <button onClick={() => handleUpdateStatus('rejected')} className="flex-1 border border-red-50 text-red-500 py-3.5 rounded-2xl text-xs font-black hover:bg-red-50 text-stone-600">Decline</button>
                                            </div>
                                        )}
                                        {isArtist && order.status === 'accepted' && (
                                            <button onClick={() => handleUpdateStatus('in_progress')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100">Start Order</button>
                                        )}
                                        {isArtist && order.status === 'in_progress' && (
                                            <div className="space-y-3">
                                                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                                                    <div className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">Delivery URL</div>
                                                    <input 
                                                        type="url" 
                                                        className="w-full text-xs p-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-deep-cocoa"
                                                        placeholder="Result link..."
                                                        value={deliverableUrl}
                                                        onChange={(e) => setDeliverableUrl(e.target.value)}
                                                    />
                                                </div>
                                                <button 
                                                    onClick={handleDeliver} 
                                                    disabled={deliverLoading || !deliverableUrl}
                                                    className="w-full bg-green-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-green-100 disabled:opacity-50"
                                                >
                                                    {deliverLoading ? 'Publishing...' : 'Complete & Deliver'}
                                                </button>
                                            </div>
                                        )}
                                        {isClient && order.status === 'pending' && (
                                            <button onClick={() => handleUpdateStatus('cancelled')} className="w-full border border-red-50 text-red-500 py-4 rounded-2xl text-xs font-black hover:bg-red-50">Cancel Request</button>
                                        )}
                                        
                                        {order.deliverableFiles?.length > 0 && (
                                            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-emerald-800">
                                                <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-3 flex items-center gap-2">
                                                    <CheckCircle2 size={14}/> Final Files
                                                </h4>
                                                <div className="space-y-3">
                                                    {order.deliverableFiles.map((file, idx) => (
                                                        <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-emerald-200 text-xs font-bold hover:shadow-md transition">
                                                            Download Artwork
                                                            <Download size={14} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Message Center */}
                    <div className="flex-1 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col relative">
                        {/* Info Bar */}
                        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-cat-cream flex items-center justify-center text-text-brown">
                                    <MessageSquare size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-deep-cocoa text-sm">Project Communication</h3>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Direct Thread</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-lg text-[10px] font-bold text-stone-500">
                                <Clock size={12} />
                                Real-time Sync
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-6 bg-stone-50/20">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h4 className="font-playfair text-xl font-bold mb-2">Start the Brief</h4>
                                    <p className="text-xs max-w-xs">Ask questions, share references, or just say hello to begin the creative process.</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                                    const showHeader = i === 0 || messages[i-1].senderId !== msg.senderId;
                                    
                                    return (
                                        <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                            {!isMine && showHeader && (
                                                <span className="text-[10px] font-black uppercase text-stone-300 tracking-widest mb-1.5 ml-2">
                                                    {msg.senderId?.email?.split('@')[0] || 'Member'}
                                                </span>
                                            )}
                                            <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-sm text-sm leading-relaxed ${
                                                isMine 
                                                ? 'bg-deep-cocoa text-white rounded-tr-sm' 
                                                : 'bg-white border border-stone-100 text-stone-700 rounded-tl-sm'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[9px] font-bold text-stone-300 mt-1.5 opacity-60">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Zone */}
                        <div className="p-8 shrink-0">
                            <form 
                                onSubmit={handleSendMessage} 
                                className={`flex items-center gap-4 bg-stone-50 p-2 rounded-[2rem] border border-stone-200 transition-all ${
                                    isFailed || order.status === 'completed' ? 'opacity-50 grayscale pointer-events-none' : 'focus-within:border-deep-cocoa focus-within:bg-white'
                                }`}
                            >
                                <button type="button" className="p-3 text-stone-400 hover:text-deep-cocoa transition">
                                    <Paperclip size={20} />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder={order.status === 'completed' ? "Order closed" : "Message here..."}
                                    className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-stone-300"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-deep-cocoa text-white p-3.5 rounded-full shadow-lg shadow-stone-200 disabled:opacity-50 transition"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
                artistName={order?.artistId?.fullName || "the artist"}
            />
        </div>
    );
};

export default OrderDetail;
