import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 150,
    },
    email: {
        type: String,
        required: [true, "User email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user','admin','moderator'],
    },
    permissions: {
        type: [String],
        enum: ['full-control','read','write','modify','delete'],
        default: [],
    },
    password: {
        type: String,
        required: [true, "User password is required"],
        minLength: 6,
    },
},
    {
        timestamps: true,
        strict: false
    });

const User = mongoose.model('User', userSchema);

export default User;