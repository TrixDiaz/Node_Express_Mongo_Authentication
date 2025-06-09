import mongoose from "mongoose";

const loginLogsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 150
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        required: true
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },
    reason: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    strict: true
});

export default mongoose.model('LoginLogs', loginLogsSchema);