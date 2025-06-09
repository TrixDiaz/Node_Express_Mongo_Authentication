// config/rateLimit.js
import rateLimit from 'express-rate-limit';

const ratelimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds (similar to Arcjet's interval)
    max: 3, // Maximum 3 requests per windowMs (similar to Arcjet's capacity)
    message: {
        success: false,
        message: "Rate limit exceeded. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default ratelimiter;