import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RequestCommissionModal = ({ isOpen, onClose, artistId, artistName }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !description.trim() || !deadline) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await createOrder({
                artistId,
                title,
                description,
                deadline
            });
            toast.success("Commission request submitted successfully!");
            onClose();
            // Redirect to the newly created order thread
            navigate(`/orders/${res.data.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-stone-100">
                    <div>
                        <h2 className="text-xl font-bold text-deep-cocoa">Request Commission</h2>
                        <p className="text-xs text-stone-500 mt-1">Send a detailed request to {artistName}</p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-red-500 transition p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-deep-cocoa mb-1">Project Title <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full text-sm p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                            placeholder="e.g., Custom Character Portrait"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-deep-cocoa mb-1">Detailed Description <span className="text-red-500">*</span></label>
                        <textarea 
                            className="w-full text-sm p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition resize-none h-32"
                            placeholder="Describe your vision, colors, style, references, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-deep-cocoa mb-1">Preferred Deadline <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            className="w-full text-sm p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                            value={deadline}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                        <p className="text-xs text-stone-400 mt-1 mt-2">The artist will review your request and accept or negotiate the terms.</p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-stone-100 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestCommissionModal;
