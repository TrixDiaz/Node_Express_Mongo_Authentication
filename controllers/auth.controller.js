import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

// Input validation helper
const validateSignUpInput = (name, email, password) => {
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters long");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Please provide a valid email address");
    }

    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    return errors;
};

const validateSignInInput = (email, password) => {
    const errors = [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Please provide a valid email address");
    }

    if (!password) {
        errors.push("Password is required");
    }

    return errors;
};

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// Helper function to sanitize user data (remove sensitive fields)
const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, __v, ...sanitizedUser } = userObj;
    return sanitizedUser;
};

export const signUp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        const validationErrors = validateSignUpInput(name, email, password);
        if (validationErrors.length > 0) {
            const error = new Error("Validation failed");
            error.statusCode = 400;
            error.details = validationErrors;
            return next(error);
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            const error = new Error("User with this email already exists");
            error.statusCode = 409;
            return next(error);
        }

        // Hash the password
        const saltRounds = 12; // Increased from 10 for better security
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: sanitizeUser(newUser),
            },
        });
    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const duplicateError = new Error("User with this email already exists");
            duplicateError.statusCode = 409;
            return next(duplicateError);
        }

        next(error);
    }
};

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Input validation
        const validationErrors = validateSignInInput(email, password);
        if (validationErrors.length > 0) {
            const error = new Error("Validation failed");
            error.statusCode = 400;
            error.details = validationErrors;
            return next(error);
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email and explicitly select password field
        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            return next(error);
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            return next(error);
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user: sanitizeUser(user),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {
    try {
        // Clear the token cookie if it exists
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({
            success: true,
            message: "User signed out successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Additional utility function for password reset token generation
export const generatePasswordResetToken = (userId) => {
    return jwt.sign({ userId, type: "password-reset" }, JWT_SECRET, {
        expiresIn: "1h", // Short expiry for password reset
    });
};

// Additional utility function to verify password reset token
export const verifyPasswordResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== "password-reset") {
            throw new Error("Invalid token type");
        }
        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};