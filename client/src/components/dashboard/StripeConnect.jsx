import React, { useState, useEffect } from 'react';
import { createConnectAccount, getArtistProfile } from '../../services/api';
import { useSelector } from 'react-redux';
import { Landmark, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../Button';
import toast from 'react-hot-toast';

const BankOnboarding = () => {
    const { user } = useSelector(state => state.auth);
    const [status, setStatus] = useState('loading'); // loading, unlinked, active
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await getArtistProfile(user._id);
                // In our academic mock, we use 'paymentSetup' instead of Stripe fields
                if (res.data.data.paymentSetup) {
                    setStatus('active');
                } else {
                    setStatus('unlinked');
                }
            } catch (error) {
                console.error("Failed to fetch onboarding status:", error);
                setStatus('unlinked');
            }
        };
        if (user?._id) fetchStatus();
    }, [user]);

    const handleMockOnboarding = async () => {
        setLoading(true);
        try {
            await createConnectAccount();
            toast.success("Academic Bank Onboarding Successful!");
            setStatus('active');
        } catch (error) {
            toast.error("Mock onboarding failed");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-muted-taupe" />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-xl ${status === 'active' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500'}`}>
                    <Landmark size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-playfair font-bold text-deep-cocoa">Academic Payment Setup</h2>
                    <p className="text-stone-500 text-sm">Simulated bank account for commission payouts</p>
                </div>
            </div>

            {status === 'active' ? (
                <div className="bg-green-50 border border-green-100 p-6 rounded-xl flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-green-800 mb-1">Onboarding Complete</h3>
                        <p className="text-green-700 text-sm">
                            Your mock bank account is active. You can now accept simulated payments from clients.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                        <h3 className="font-bold mb-2 flex items-center gap-2 text-deep-cocoa">
                            <AlertCircle size={18} className="text-stone-400" />
                            Ready to accept payments?
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            To receive funds for your work, you need to simulate linking a bank account. 
                            In this academic version, clicking below will immediately verify your "account".
                        </p>
                    </div>

                    <Button 
                        onClick={handleMockOnboarding} 
                        isLoading={loading}
                        className="w-full py-4 text-lg shadow-lg"
                    >
                        Complete Mock Onboarding
                    </Button>
                    
                    <p className="text-center text-xs text-stone-400 italic">
                        * No actual financial data or external APIs are used in this simulation.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BankOnboarding;
