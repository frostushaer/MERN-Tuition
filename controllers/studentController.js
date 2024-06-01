import { User } from "../models/user.js";
import { Student } from "../models/student.js";
import { Batch } from "../models/batch.js";
import { RequestFor } from "../models/request.js";
import { Tuition } from "../models/tuition.js";

export const registerStudent = async (req, res) => {
    // getting the data from the request body
    const { address, postalCode, phone, dateOfBirth, parentPhone, school, studyIn } = req.body;
    const { uid } = req.params;
    try {
        // finding the user with the uid
        const user = await User.findOne({ uid: uid });
        if (!user) {
            // if user does not exist, return a message
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // creating a new student object
        const newStudent = new Student({ 
            user: user._id,
            uid: uid,
            address: address,
            postalCode: postalCode,
            phone: phone,
            dateOfBirth: dateOfBirth,
            parentPhone: parentPhone,
            school: school,
            studyIn: studyIn
        });
        // save the student to the database
        await newStudent.save();
        // update the user's student property with the newly created student objectId
        user.student = newStudent._id;
        await user.save();

        res.status(201).json({ success: true, message: 'Student created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getAllTuitions = async (req, res) => {
    try {
        // Find all the tuitions where isVerified is true
        const verifiedTuitions = await Tuition.find();

        res.status(200).json({ success: true, data: verifiedTuitions });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const requestBatchJoin = async (req, res) => {
    const { uid } = req.params;
    const { batchId } = req.body;
    try {
        const student = await Student.findOne({ uid: uid });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const batch = await Batch.findOne({ _id: batchId }).populate('teachers');
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        if (student.enrolledBatches.includes(batchId) ) {
            return res.status(400).json({ success: false, message: 'Student already in the batch' });
        }
        // Check if the student already has a request for the same batch
        const existingRequest = await RequestFor.findOne({
            from: student._id,
            reason: batch._id
        });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'Request already exists for this batch' });
        }
        // Get all the teachers from the batch
        const teacherIds = batch.teachers.map(teacher => teacher._id);
        const newRequest = new RequestFor({
            from: student._id,
            fromModel: 'Student',
            to: teacherIds,
            toModel: 'Teacher',
            reasonModel: 'Batch',
            reason: batch._id,
        });
        // Save the new request to the database
        await newRequest.save();
        res.status(201).json({ success: true, message: 'Batch join request sent successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getEnrolledBatches = async (req, res) => {
    const { uid } = req.params;
    try {
        const student = await Student.findOne({ uid: uid });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const enrolledBatches = await Batch.find({ _id: { $in: student.enrolledBatches } }).populate('tuition');

        res.status(200).json({ success: true, data: enrolledBatches });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};