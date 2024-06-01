import mongoose from "mongoose";

const tuitionSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: false,
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false,
    }],
    batches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: false,
    }],
    subjects: [{
        type: String, required: true,
    }],
    name: {
        type: String, required: true,
    },
    address: {
        type: String, required: true,
    },
    postalCode: {
        type: String, required: true,
    },
    coordinates: {
        lat: {
            type: Number,
            required: true,
        },
        lang: {
            type: Number,
            required: true,
        },
    },
    imageUrl: [{
        type: String, required: false,
    }],
    description: {
        type: String, required: false,
    },
    fees: {
        type: Number, required: false,
    },
    rating: {
        type: Number, required: false,
    },
}, {timestamps: true});

export const Tuition = mongoose.model('Tuition', tuitionSchema);