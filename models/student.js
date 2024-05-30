import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uid: {
        type: String, required: true,
    },
    address: {
        type: String, required: true,
    },
    postalCode: {
        type: String, required: true,
    },
    phone: {
        type: String, required: true,
    },
    dateOfBirth: {
        type: Date, required: true,
    },
    studyIn: {
        type: String, required: true,
    },
    school: {
        type: String, required: true,
    },
    parentPhone: {
        type: String, required: false,
    },

});

export const Student = mongoose.model('Student', studentSchema);