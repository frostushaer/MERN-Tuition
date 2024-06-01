import { User } from "../models/user.js";
import { Teacher } from "../models/teacher.js";
import sendEmail from "../utils/smtpFunction.js";
import { Tuition } from "../models/tuition.js";
import { Batch } from "../models/batch.js";
import { RequestFor } from "../models/request.js";
import { Student } from "../models/student.js";

export const registerTeacher = async (req, res) => { 
    // getting the data from the request body
    const { school, phone, dateOfBirth, highestQualifications, teachingExperience, subjects } = req.body;
    const { uid } = req.params;
    try {
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // check if the user already has a request with from: user._id and reasonModel is Teacher
        const existingRequest = await RequestFor.findOne({ from: user._id, reasonModel: 'Teacher' });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'Teacher request already exists' });
        }
        // get all the users whose type is Admin
        const adminUsers = await User.find({ type: 'Admin' });
        // create a new request object
        const newRequest = new RequestFor({
            from: user._id,
            fromModel: 'User',
            to: adminUsers.map(admin => admin._id),
            toModel: 'Admin',
            reason: {
                school: school,
                phone: phone,
                dateOfBirth: dateOfBirth,
                highestQualifications: highestQualifications,
                teachingExperience: teachingExperience,
                subjects: subjects
            },
            reasonModel: 'Teacher',
        });
        await newRequest.save();
        sendEmail(user.email, 'Teacher Registration Request Sent');
        res.status(201).json({ success: true, message: 'Teacher request sent successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const updateTeacher = async (req, res) => {
    // we will change this when we will use authentication
    const { uid } = req.params;
    try {
        // finding the teacher associated with the user
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            // if teacher does not exist, return a message
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        // updating the teacher data
        teacher.school = req.body.school || teacher.school;
        teacher.phone = req.body.phone || teacher.phone;
        teacher.dateOfBirth = req.body.dateOfBirth || teacher.dateOfBirth;
        teacher.highestQualifications = req.body.highestQualifications || teacher.highestQualifications;
        teacher.teachingExperience = req.body.teachingExperience || teacher.teachingExperience;
        teacher.subjects = req.body.subjects || teacher.subjects;
        // save the updated teacher to the database
        await teacher.save();
        res.status(200).json({ success: true, message: 'Teacher updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const applyForTuition = async (req, res) => {
    const { uid } = req.params;
    const { subjects, name, address, postalCode, coordinates: {lat, lang} } = req.body;
    try {
        // finding the teacher associated with the user
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const existingRequestForTuition = await RequestFor.findOne({ from: teacher._id, reasonModel: 'Tuition' });
        if (existingRequestForTuition) {
            return res.status(400).json({ success: false, message: 'Teacher has already applied for a tuition' });
        }
        // Get all the admin users
        const adminUsers = await User.find({ type: 'Admin' });
        // Create a new request for tuition registration
        const newRequest = new RequestFor({
            from: teacher._id,
            fromModel: 'Teacher',
            to: adminUsers.map(admin => admin._id),
            toModel: 'Admin',
            reason: {
                owner: teacher._id,
                teachers: [teacher._id],
                subjects: subjects,
                name: name,
                address: address,
                postalCode: postalCode,
                coordinates: { lat: lat, lang: lang }
            }, 
            reasonModel: 'Tuition',
        });
        // Save the new request to the database
        await newRequest.save();
        await teacher.save();
        res.status(201).json({ success: true, message: 'Tuition registration request sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const requestToJoinTuition = async (req, res) => {
    const { uid } = req.params;
    const { tuitionId } = req.body;
    try {
        // finding the teacher associated with the user
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        // finding the tuition with the tuitionId
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        // check if teacher is already in pendingTeachers
        if (!tuition.pendingTeachers.includes(teacher._id)) {
            // add the teacher to the pendingTeachers array of the tuition
            tuition.pendingTeachers.push(teacher._id);
        }
        await tuition.save();
        res.status(200).json({ success: true, message: 'Request sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};  

export const getOwnedTuition = async (req, res) => {
    const { uid } = req.params;
    try {
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const tuition = await Tuition.find({ owner: teacher._id });
        res.status(200).json({ success: true, tuition: tuition });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getEnrolledTuitions = async (req, res) => {
    const { uid } = req.params;
    try {
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const tuition = await Tuition.find({ teachers: teacher._id });
        res.status(200).json({ success: true, tuition: tuition });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getAssignedBatches = async (req, res) => {
    const { uid } = req.params;
    try {
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        // Find batches assigned to the teacher
        const batches = await Batch.find({ _id: { $in: teacher.batchAssigned } });

        res.status(200).json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getRequests = async (req, res) => {
    const { uid } = req.params;
    try {
        const requests = await RequestFor.find({ 
            to: uid,
            fromModel: 'Student',
        }).populate('from').populate('reason');
        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: 'No pending requests found for the specified user' });
        }
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const acceptBatchJoinRequest = async (req, res) => {
    const { teacherId } = req.params;
    const { requestId, action } = req.body;
    try {
        const request = await RequestFor.findOne ({ _id: requestId });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        // Check if the request is addressed to the user
        if (!request.to.includes(teacherId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized to accept this request' });
        }
        // If action is delete, remove the request
        if (action === 'delete') {
            await RequestFor.deleteOne({ _id: requestId });
            return res.status(200).json({ success: true, message: 'Request deleted successfully' });
        }
        // If action is accept, process the acceptance
        if (action === 'approve') {
            const studentId = request.from;
            const batchId = request.reason;
            const batch = await Batch.findById(batchId);
            if (!batch) {
                return res.status(404).json({ success: false, message: 'Batch not found' });
            }
            const tuitionId = batch.tuition;
            const tuition = await Tuition.findById(tuitionId);
            if (!tuition) {
                return res.status(404).json({ success: false, message: 'Tuition not found' });
            }
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            // Add the student to the batch and tuition
            batch.students.push(studentId);
            tuition.students.push(studentId);
            // Add the batch and tuition to the student
            student.enrolledBatches.push(batchId);
            student.enrolledTuitions.push(tuitionId);

            // Save all the changes
            await batch.save();
            await tuition.save();
            await student.save();

            // Delete the request after accepting
            await RequestFor.deleteOne({ _id: requestId });

            return res.status(200).json({ success: true, message: 'Request accepted and student added to batch and tuition' });
        }
        return res.status(400).json({ success: false, message: 'Invalid action specified' });
        
    } catch (error) { 
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};