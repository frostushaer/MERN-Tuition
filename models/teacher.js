import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uid: {
        type: String, required: true,
    },
    school: {
        type: String,
        required: true,
    },
    phone: {
        type: String, required: true,
    },
    dateOfBirth: {
        type: Date, required: true,
    },
    highestQualifications: {
        type: String, required: true,
    },
    teachingExperience: {
        type: String, required: true,
    },
    subjects: [{
        type: String, required: true,
    }],
    isVerified: {
        type: Boolean, default: false,
    },
    tuitionOwned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tuition',
        required: false,
    }],

});

export const Teacher = mongoose.model('Teacher', teacherSchema);