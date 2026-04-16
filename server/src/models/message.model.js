import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "CommissionOrder",
            required: true,
            index: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        message: {
            type: String,
            trim: true
        },
        // Cloudinary URL for image attachments shared in chat
        imageUrl: {
            type: String,
            default: null
        },
        attachments: [{
            type: String // Additional file URLs
        }]
    },
    { timestamps: true }
);

// At least one of message or imageUrl must be present (validated in controller)

export const Message = mongoose.model("Message", messageSchema);
