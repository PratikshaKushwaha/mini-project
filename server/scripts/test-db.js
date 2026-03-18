import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Checking MONGO_URI:", process.env.MONGO_URI);

const testConnect = async () => {
    try {
        console.log("Attempting to connect...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
};

testConnect();
