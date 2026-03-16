import React, { useState, useEffect } from 'react';
import { getServices, createService } from '../../services/api';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';

const ServiceManager = () => {
    const { user } = useSelector(state => state.auth);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchServices();
    }, [user]);

    const fetchServices = async () => {
        try {
            const res = await getServices(user._id);
            setServices(res.data.data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setMessage('');
        try {
            await createService({
                title: data.title,
                description: data.description,
                basePrice: Number(data.basePrice),
                deliveryTime: Number(data.deliveryTime),
                serviceType: data.serviceType
            });
            setMessage('Service created successfully!');
            reset();
            fetchServices();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to create service');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h2 className="text-2xl font-playfair mb-6">Service Manager</h2>
            
            {message && (
                <div className={`p-4 mb-6 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mb-12 p-6 bg-stone-50 border border-stone-200 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Create New Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input label="Title" {...register('title', { required: true })} required />
                    <Input label="Service Type" placeholder="e.g. Character Design, UI/UX" {...register('serviceType', { required: true })} required />
                    <Input label="Base Price ($)" type="number" min="1" {...register('basePrice', { required: true })} required />
                    <Input label="Delivery Time (Days)" type="number" min="1" {...register('deliveryTime', { required: true })} required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-deep-cocoa mb-1">Description</label>
                    <textarea 
                        {...register('description')}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-taupe bg-white"
                        rows="3"
                        required
                    ></textarea>
                </div>
                <Button type="submit" isLoading={isSubmitting}>Create Service</Button>
            </form>

            <h3 className="text-lg font-bold mb-4 border-b pb-2">Your Active Services</h3>
            {loading ? (
                <p>Loading...</p>
            ) : services.length === 0 ? (
                <p className="text-muted-taupe italic">You haven't offered any services yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map(svc => (
                        <div key={svc._id} className="border border-stone-200 rounded-lg p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-deep-cocoa">{svc.title}</h4>
                                <span className="bg-warm-stone/20 text-deep-cocoa px-3 py-1 rounded-full text-xs font-bold">${svc.basePrice}</span>
                            </div>
                            <span className="text-xs text-muted-taupe font-medium uppercase tracking-wider block mb-3">{svc.serviceType}</span>
                            <p className="text-sm text-stone-600 mb-4 line-clamp-2">{svc.description}</p>
                            <div className="text-xs font-medium text-stone-500 bg-stone-100 inline-block px-2 py-1 rounded">
                                Delivery: ~{svc.deliveryTime} days
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceManager;
