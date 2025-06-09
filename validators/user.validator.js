import { body, param } from "express-validator";

// Validate User ID param (e.g., /:id)
export const validateUserId = [
    param("id").isMongoId().withMessage("Invalid user ID format"),
];

// Create User Validation
export const createUserValidator = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

// Update User Validation
export const updateUserValidator = [
    ...validateUserId,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
];

// Update User Password Validation
export const updateUserPasswordValidator = [
    ...validateUserId,
    body("password")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("confirmPassword")
        .custom((value, { req }) => {
            if (!value || value !== req.body.password) {
                throw new Error("Password does not match");
            }
            return true;
        }),
];