import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Button from './Button';

const ReviewModal = ({ isOpen, onClose, onSubmit, artistName }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-text-brown p-8 text-center text-white">
                    <h2 className="text-2xl font-playfair font-bold">Review Your Experience</h2>
                    <p className="text-stone-300 text-sm mt-1">How was your commission with {artistName}?</p>
                </div>

                <div className="p-8">
                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition transform hover:scale-110"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star 
                                    className={`w-10 h-10 ${
                                        (hover || rating) >= star 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-stone-200'
                                    }`} 
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Comment (Optional)</label>
                            <textarea 
                                rows="4"
                                placeholder="Share your feedback..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full border border-stone-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-btn-brown focus:border-transparent transition"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={onClose}>Skip for Now</Button>
                            <Button className="flex-1" onClick={() => onSubmit({ rating, comment })}>Submit Review</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
