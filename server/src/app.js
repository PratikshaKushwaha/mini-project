import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { configurePassport } from "./config/passport.js";

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
import feedbackRoutes from "./routes/feedback.routes.js";

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("../public"));

// ─── NoSQL Injection Sanitization ─────────────────────────────────────────────
app.use(mongoSanitize());

// ─── Logging (dev only) ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan("dev"));
}

// ─── Passport ─────────────────────────────────────────────────────────────────
configurePassport(passport);
app.use(passport.initialize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20, // Stricter limit for auth endpoints
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication attempts. Please wait." }
});

app.use('/api', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/artists", artistRoutes);
app.use("/api/v1/portfolio", portfolioRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/orders/:id/messages", messageRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/feedback", feedbackRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error("API ERROR:", { message: err.message, statusCode: err.statusCode });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ success: false, message, errors: err.errors || [] });
});

export default app;
