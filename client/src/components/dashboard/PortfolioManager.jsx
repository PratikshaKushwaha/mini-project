import React, { useState, useEffect } from 'react';
import { getPortfolio, addPortfolioItem, deletePortfolioItem } from '../../services/api';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';

const PortfolioManager = () => {
    const { user } = useSelector(state => state.auth);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, [user]);

    const fetchPortfolio = async () => {
        try {
            const res = await getPortfolio(user._id);
            setItems(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Note: Since cloudinary is mocked, we expect a mediaUrl directly.
            // In a real app we'd upload the file first.
            await addPortfolioItem({
                title: data.title,
                description: data.description,
                price: parseFloat(data.price) || 0,
                mediaUrl: data.mediaUrl || `https://picsum.photos/seed/${Math.random()}/800/600`
            });
            reset();
            fetchPortfolio();
        } catch (error) {
            console.error('Failed to add item', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Delete this portfolio item?')) {
            try {
                await deletePortfolioItem(id);
                fetchPortfolio();
            } catch (error) {
                console.error('Failed to delete', error);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h2 className="text-2xl font-playfair mb-6">Artwork Showcase (Posts)</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="mb-12 p-6 bg-stone-50 border border-stone-200 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input label="Title" {...register('title', { required: true })} required />
                    <Input label="Price ($)" type="number" step="0.01" {...register('price')} />
                </div>
                <div className="mb-4">
                    <Input label="Media URL (Optional Mock)" placeholder="Leave blank for random image" {...register('mediaUrl')} />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-deep-cocoa mb-1">Description</label>
                    <textarea 
                        {...register('description')}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-taupe bg-white"
                        rows="2"
                    ></textarea>
                </div>
                <Button type="submit" isLoading={isSubmitting}>Add Item</Button>
            </form>

            <h3 className="text-lg font-bold mb-4 border-b pb-2">Your Artwork Posts</h3>
            {loading ? (
                <p>Loading...</p>
            ) : items.length === 0 ? (
                <p className="text-muted-taupe italic">No items in your portfolio yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item._id} className="border border-stone-200 rounded-lg overflow-hidden flex flex-col">
                            <img src={item.mediaUrl} alt={item.title} className="w-full h-48 object-cover" />
                            <div className="p-4 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg">{item.title}</h4>
                                    {item.price > 0 && (
                                        <span className="bg-bg-cream text-text-brown px-2 py-1 rounded text-sm font-bold border border-warm-stone">
                                            ${item.price}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-stone-600 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
                                <button onClick={() => handleDelete(item._id)} className="text-red-600 text-sm font-medium hover:underline">Delete Post</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortfolioManager;
