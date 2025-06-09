import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {JWT_SECRET, JWT_EXPIRES_IN} from "../config/env.js";
import transporter from "../config/nodemailer.js";

export const signUp = async (req, res, next) => {
    try {
        // Logic to create a new user
        const {name, email, password} = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({email: email});

        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            return next(error);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
        });

        const token = jwt.sign({userId: newUser._id}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUser,
            },
        });
    } catch (error) {
        next(error);
    }
};
export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        // Find user by email
        const user = await User.findOne({email: email});

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error("Invalid password");
            error.statusCode = 401;
            return next(error);
        }

        // Generate JWT token
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {
    try {
        // Invalidate the token by removing it from the client side
        res.clearCookie("token");

        res.status(200).json({
            success: true,
            message: "User signed out successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const {email} = req.body;

        if (!email) {
            const error = new Error("Email is required");
            error.statusCode = 401;
            return next(error);
        }

        // Find user by email
        const user = await User.findOne({email: email});

        // If user does not exist
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        // Generate reset token
        const resetToken = jwt.sign({userId: user._id}, JWT_SECRET, {
            expiresIn: "1h",
        });

        // Create reset password URL
        const resetURL = `http://yourfrontend.com/reset-password/${resetToken}`;

        // Configure mail options
        const mailOptions = {
            from: 'noreply@noreply.com',
            to: user.email,
            subject: 'Password Reset Request',
            text: `Hello ${user.name},\n\n`
                + `You have requested to reset your password.\n\n`
                + `Please click on the following link to reset your password:\n`
                + `${resetURL}\n\n`
                + `This link will expire in 1 hour.\n\n`
                + `If you did not request this, please ignore this email.\n`
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Password reset link sent to email",
            data: {
                resetToken,
                resetURL,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            const error = new Error("Token and password are required");
            error.statusCode = 400;
            return next(error);
        }

        // Verify token
        let decodedToken;

        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            error.message = "Invalid or expired token";
            error.statusCode = 401;
            return next(error);
        }

        // Find user
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        next(error);
    }
};
