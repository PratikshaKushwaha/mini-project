import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api, { createOrder, createCheckoutSession } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { ShieldCheck, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderCheckout = () => {
    // We expect the route to be /checkout/:artistId/:serviceId
    const { artistId, serviceId } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleRazorpayPayment = async (razorData, orderId) => {
        const options = {
            key: razorData.keyId,
            amount: razorData.amount,
            currency: razorData.currency,
            name: "ArtisanConnect",
            description: `Payment for Order #${orderId}`,
            order_id: razorData.orderId,
            handler: function (response) {
                toast.success("Payment successful!");
                navigate('/client-dashboard');
            },
            prefill: {
                name: "User Name", // Ideally from Redux user state
                email: "user@example.com",
            },
            theme: {
                color: "#3d3028",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            toast.error("Payment failed: " + response.error.description);
        });
        rzp.open();
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setErrorMsg("");
        
        try {
            const orderData = {
                artistId,
                serviceId,
                requirements: data.requirements,
                deadline: data.deadline || undefined,
                referenceFiles: data.referenceFiles ? [data.referenceFiles] : []
            };

            const orderRes = await createOrder(orderData);
            const createdOrder = orderRes.data.data;

            // Trigger Razorpay Order creation
            const razorRes = await createCheckoutSession(createdOrder._id);
            const razorData = razorRes.data.data;

            // Open Razorpay Modal
            await handleRazorpayPayment(razorData, createdOrder._id);
            
        } catch (error) {
           setErrorMsg(error.response?.data?.message || "Failed to initiate payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-bg-cream min-h-screen py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-text-brown mb-6 flex items-center gap-1 font-medium transition">
                    ← Back to Service
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
                    <div className="bg-text-brown p-8 text-white">
                        <h1 className="text-3xl font-playfair font-bold mb-2">Checkout Details</h1>
                        <p className="text-stone-300">Provide the requirements for your custom commission.</p>
                    </div>

                    <div className="p-8">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div>
                                <label className="block text-sm font-bold text-deep-cocoa mb-2">Project Requirements <span className="text-red-500">*</span></label>
                                <textarea 
                                    className={`w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-btn-brown transition ${errors.requirements ? 'border-red-300' : 'border-stone-200'}`}
                                    rows="5"
                                    placeholder="Describe your vision, specific details, dimensions, colors..."
                                    {...register('requirements', { required: "Requirements are required to place an order." })}
                                ></textarea>
                                {errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-deep-cocoa mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-stone-400" /> Target Deadline (Optional)
                                    </label>
                                    <input 
                                        type="date"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-btn-brown transition"
                                        {...register('deadline')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-deep-cocoa mb-2">Reference Material URL</label>
                                    <input 
                                        type="url"
                                        placeholder="https://link-to-your-image.com"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-btn-brown transition"
                                        {...register('referenceFiles')}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-stone-100">
                                <Button type="submit" isLoading={isSubmitting} className="w-full py-4 text-lg">
                                    <CreditCard className="w-5 h-5 mr-2 inline" /> Place Secure Order
                                </Button>
                                <p className="text-xs text-stone-400 text-center mt-4">
                                    By placing this order, you agree to the artist's terms of service. You will not be charged until the artist accepts.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCheckout;
