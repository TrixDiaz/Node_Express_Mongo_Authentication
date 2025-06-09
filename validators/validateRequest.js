import {validationResult} from "express-validator";

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(error => error.msg);
        return res.status(400).json({
            success: false,
            message: messages[0] // Return only the first error message
            // For multiple messages use: messages: messages
        });
    }
    next();
};
