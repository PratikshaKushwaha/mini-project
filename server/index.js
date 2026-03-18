import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

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
