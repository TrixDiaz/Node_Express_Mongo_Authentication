import {body} from "express-validator";

export const signUpValidator = [
    body('name').notEmpty().isLength({min: 2}).withMessage('Name is required or invalid minimum or 2 characters'),
    body('email').isEmail().withMessage('Valid email is required or invalid'),
    body('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters'),
];

export const signInValidator = [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [
    body('email').isEmail().withMessage('Email is required or invalid'),
];

export const resetPasswordValidator = [
    body('password').notEmpty().isLength({min: 6}).withMessage('Password is required or invalid'),
];