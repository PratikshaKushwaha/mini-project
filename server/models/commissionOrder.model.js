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
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "CommissionService",
            required: true
        },
        requirements: {
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
            enum: ['Requested', 'Accepted', 'Rejected', 'In Progress', 'Ready for Delivery', 'Delivered', 'Revision Requested', 'Completed', 'Cancelled'],
            default: 'Requested',
            index: true
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        stripeSessionId: {
            type: String
        },
        deliverableFiles: [{
            type: String // Cloudinary URLs for final high-res work
        }]
    },
    { timestamps: true }
);

export const CommissionOrder = mongoose.model("CommissionOrder", commissionOrderSchema);
