import mongoose, { Schema } from "mongoose";

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
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
            default: 'pending',
            index: true
        },
        statusHistory: [{
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: "User"
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
