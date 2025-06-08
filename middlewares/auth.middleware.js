import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config/env.js";
import User from "../models/user.model.js";

const authorize = async (req, res, next) => {
    try {
        let token;

        // Check if the token is provided in the Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If the token is not provided, return an unauthorized error
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access, no token provided",
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access, user not found",
            });
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized access",
            error: error.message,
        });
    }
};

export default authorize;
