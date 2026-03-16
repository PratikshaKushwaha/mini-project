import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        type: {
            type: String,
            enum: ["ORDER_UPDATE", "NEW_MESSAGE", "PAYMENT_RECEIVED", "REVIEW_RECEIVED", "GENERAL"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        link: {
            type: String // Link to the specific order or profile
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
