import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Artist Onboarding - Razorpay doesn't have a direct Connect equivalent as surgical as Stripe for simple academic/MVP apps, 
// so we'll just track if they've provided their payment details (like UPI/Bank) in their profile for manual transfers or use a simple flag.
const createConnectAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const profile = await ArtistProfile.findOne({ artistId: userId });

    if (!profile) {
        throw new ApiError(404, "Artist profile not found");
    }

    // In a real production app with Razorpay, you might use Route or simply collect bank details.
    // For now, we'll mark them as onboarded if they initiate this.
    profile.stripeOnboarded = true; 
    await profile.save();

    return res.status(200).json(
        new ApiResponse(200, { success: true }, "Payment Onboarding Complete")
    );
});

// 2. Client Checkout - Create Razorpay Order
const createCheckoutSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const clientId = req.user._id;

    const order = await CommissionOrder.findOne({ _id: orderId, clientId }).populate('artistId');
    if (!order) throw new ApiError(404, "Order not found");

    const options = {
        amount: order.price * 100, // Razorpay amount in paise
        currency: "INR",
        receipt: `receipt_order_${order._id}`,
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);
        
        order.stripeSessionId = razorpayOrder.id; // Reusing field for simplicity or rename if needed
        await order.save();

        return res.status(200).json(
            new ApiResponse(200, {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }, "Razorpay Order Generated")
        );
    } catch (error) {
        console.error("Razorpay error:", error);
        throw new ApiError(500, "Failed to create Razorpay order");
    }
});

export {
    createConnectAccount,
    createCheckoutSession
};
