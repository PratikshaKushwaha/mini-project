import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tag, setTag] = useState('Discussion');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', body);
        formData.append('tag', tag);
        if (image) formData.append('image', image);

        await onSubmit(formData);
        
        setLoading(false);
        setTitle('');
        setBody('');
        setImage(null);
        setPreview(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-playfair font-bold text-deep-cocoa">Create Post</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-text-brown">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <input
                            type="text"
                            placeholder="Post Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full text-lg font-bold placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0"
                        />
                    </div>

                    <div>
                        <textarea
                            placeholder="What do you want to share with the community?"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            rows="4"
                            className="w-full text-stone-600 placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0 resize-none"
                        ></textarea>
                    </div>

                    {preview && (
                        <div className="relative rounded-lg overflow-hidden h-40 bg-stone-100">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => { setImage(null); setPreview(null); }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer text-stone-400 hover:text-btn-brown transition flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">Add Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>

                            <select 
                                value={tag} 
                                onChange={(e) => setTag(e.target.value)}
                                className="text-sm border-none bg-stone-50 text-stone-600 rounded-full py-1 focus:ring-0 cursor-pointer outline-none"
                            >
                                <option value="Discussion">Discussion</option>
                                <option value="Showcase">Showcase</option>
                                <option value="Question">Question</option>
                                <option value="Announcement">Announcement</option>
                            </select>
                        </div>

                        <Button type="submit" disabled={loading || !title || !body}>
                            {loading ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
