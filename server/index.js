import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";


/**
 * @description Entry point for the ArtisanConnect Backend.
 * Establishes database connection and starts the Express server with WebSockets.
 */
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        
        const server = http.createServer(app);
        
        const io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:5173",
                credentials: true
            }
        });

        app.set("io", io);

        io.on("connection", (socket) => {
            console.log(`User connected to socket: ${socket.id}`);

            socket.on("joinOrder", (orderId) => {
                socket.join(orderId);
                console.log(`Socket ${socket.id} joined room: ${orderId}`);
            });

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        server.listen(PORT, () => {
             console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
