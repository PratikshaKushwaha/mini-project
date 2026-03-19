import mongoose, { Schema } from "mongoose";

const ALL_STATUSES = [
    'pending',          // Custom order: client submitted, waiting for artist response
    'awaiting_price',   // Custom order: artist accepted, needs to quote price
    'price_quoted',     // Custom order: artist set price, waiting for client to confirm
    'accepted',         // Both parties agreed; work begins
    'in_progress',      // Artist is working
    'completed',        // Artist marked complete
    'rejected',         // Artist rejected the custom request
    'cancelled'         // Client cancelled
];

const commissionOrderSchema = new Schema(
    {
        artistId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        orderType: {
            type: String,
            enum: ['direct', 'custom'],
            default: 'custom',
            required: true
        },
        // For direct purchases: reference to the portfolio item being bought
        portfolioItemId: {
            type: Schema.Types.ObjectId,
            ref: "PortfolioItem",
            default: null
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        referenceFiles: [{
            type: String // Cloudinary URLs
        }],
        deadline: {
            type: Date
        },
        price: {
            type: Number,
            default: null // Set at creation for direct orders; set by artist for custom
        },
        priceConfirmed: {
            type: Boolean,
            default: false // Client must confirm quoted price for custom orders
        },
        status: {
            type: String,
            enum: ALL_STATUSES,
            default: 'pending',
            index: true
        },
        statusHistory: [{
            status: {
                type: String,
                enum: ALL_STATUSES
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            note: {
                type: String
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        deliverableFiles: [{
            type: String // Cloudinary URLs for final high-res work
        }]
    },
    { timestamps: true }
);

export const CommissionOrder = mongoose.model("CommissionOrder", commissionOrderSchema);
