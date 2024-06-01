import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    to: [{
        type: mongoose.Schema.Types.ObjectId, refPath: 'toModel', required: true,
    }],
    toModel: {
        type: String,
        enum: ['User', 'Teacher', 'Tuition', 'Batch', 'Student', 'Admin'],
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'fromModel',
        required: true,
    },
    fromModel: {
        type: String,
        enum: ['User', 'Teacher', 'Tuition', 'Batch', 'Student'],
        required: true,
    },
    reason: {
        type: mongoose.Schema.Types.Mixed, required: true,
    },
    reasonModel: {
        type: String,
        enum: ['User', 'Teacher', 'Tuition', 'Batch', 'Student'],
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected'],
        required: false,
    }
});

export const RequestFor = mongoose.model('Request', requestSchema);