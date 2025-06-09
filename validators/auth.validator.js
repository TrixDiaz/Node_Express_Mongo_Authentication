import { body } from "express-validator";

export const signUpValidator = [
    body('name')
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage('Name is required or must be at least 2 characters'),

    body('email')
        .notEmpty()
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (!value || value !== req.body.password) {
                throw new Error('Password does not match');
            }
            return true;
        }),
];

export const signInValidator = [
    body('email')
        .notEmpty()
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export const forgotPasswordValidator = [
    body('email')
        .notEmpty()
        .isEmail()
        .withMessage('Valid email is required'),
];

export const resetPasswordValidator = [
    body('password')
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage('Password is required or must be at least 6 characters'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (!value || value !== req.body.password) {
                throw new Error('Password does not match');
            }
            return true;
        }),
];