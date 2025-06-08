import User from "../models/user.model.js";
import {signUp} from "./auth.controller.js";
import bcryptjs from "bcryptjs";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const storeUser = async (req, res, next) => {
    try {
        await signUp(req, res, next);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            const error = new Error("No Authenticated User found");
            error.statusCode = 404;
            return next(error);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserPassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            const error = new Error("No Authenticated User found");
            error.statusCode = 404;
            return next(error);
        }

        const { oldPassword, newPassword } = req.body;

        // Validate that both passwords are provided
        if (!oldPassword || !newPassword) {
            const error = new Error("Both old password and new password are required");
            error.statusCode = 400;
            return next(error);
        }

        // Validate new password length (optional but recommended)
        if (newPassword.length < 6) {
            const error = new Error("New password must be at least 6 characters long");
            error.statusCode = 400;
            return next(error);
        }

        // Compare old password with stored password
        // Option 1: If you have a static method on your User model
        let isMatch;
        if (typeof User.comparePassword === 'function') {
            isMatch = await User.comparePassword(oldPassword, user.password);
        } else {
            // Option 2: Direct bcrypt comparison
            isMatch = await bcryptjs.compare(oldPassword, user.password);
        }

        if (!isMatch) {
            const error = new Error("Old password is incorrect");
            error.statusCode = 400;
            return next(error);
        }

        // Check if new password is different from old password
        const isSamePassword = await bcryptjs.compare(newPassword, user.password);
        if (isSamePassword) {
            const error = new Error("New password must be different from the old password");
            error.statusCode = 400;
            return next(error);
        }

        // Hash the new password before saving
        const saltRounds = 12;
        const hashedNewPassword = await bcryptjs.hash(newPassword, saltRounds);

        // Update the user's password
        user.password = hashedNewPassword;
        await user.save();

        // Send success response
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: null,
        });
    }  catch (error) {
        next(error);
    }
};