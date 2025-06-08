import nodemailer from 'nodemailer';

import {EMAIL_HOST, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_USER} from './env.js'

export const accountEmail = EMAIL_USER;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
        user: accountEmail,
        pass: EMAIL_PASSWORD
    }
})

export default transporter;