import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import artistRoutes from "./routes/artist.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import orderRoutes from "./routes/order.routes.js";
import messageRoutes from "./routes/message.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import postRoutes from "./routes/post.routes.js";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { configurePassport } from "./config/passport.js";


const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Passport Initialization
configurePassport(passport);
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/artists", artistRoutes);
app.use("/api/v1/portfolio", portfolioRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/orders/:id", messageRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/posts", postRoutes);

// General Error Handler
app.use((err, req, res, next) => {
    console.error("DEBUG - API ERROR:", {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack
    });
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({ 
        success: false, 
        message,
        errors: err.errors || []
    });
});

export default app;
