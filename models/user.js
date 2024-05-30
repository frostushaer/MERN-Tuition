import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        default: 'Default',
        enum: ['Default', 'Admin', 'Student', 'Teacher'],
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: false,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
    },
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);