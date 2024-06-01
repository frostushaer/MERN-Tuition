import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
    tuition: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Tuition', required: true,
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,ref: 'Teacher', required: false,
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,ref: 'Student',required: false,
    }],
    name: {type: String,required: true,
    },
    description: {type: String,required: true,
    },
    subject: {type: String,required: true,
    },
    schedule: [{
        day: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true,
        }],
        startTime: {
            type: String,
            required: true,
        }
    }],
    fee: {type: Number,required: true,
    },
    enrolling: {
        type: Boolean,default: true,required: false,
    },
});

export const Batch = mongoose.model('Batch', batchSchema);