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
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        attachments: [{
            type: String // URLs
        }]
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
