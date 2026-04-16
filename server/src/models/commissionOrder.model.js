import mongoose, { Schema } from "mongoose";

/**
 * @constant ALL_STATUSES
 * @description Standardized lifecycle stages for a commission engagement.
 */
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

/**
 * @typedef {Object} CommissionOrder
 * @property {ObjectId} artistId - Assigned creative lead.
 * @property {ObjectId} clientId - Initiating customer.
 * @property {('direct'|'custom')} orderType - Engagement model.
 * @property {number} price - Finalized financial commitment.
 * @property {string} status - Current lifecycle phase.
 */

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
            default: null
        },
        priceConfirmed: {
            type: Boolean,
            default: false
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
            type: String // Cloudinary URLs
        }]
    },
    { timestamps: true }
);

export const CommissionOrder = mongoose.model("CommissionOrder", commissionOrderSchema);
