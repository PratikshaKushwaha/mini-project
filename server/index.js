import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";


/**
 * @description Entry point for the ArtisanConnect Backend.
 * Establishes database connection and starts the Express server.
 */
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
             console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
