// config/rateLimit.js
import rateLimit from 'express-rate-limit';

const ratelimiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 3, // Maximum 3 requests per minute
    message: {
        success: false,
        message: "Rate limit exceeded. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default ratelimiter;