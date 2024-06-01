import { User } from "../models/user.js";
import { Admin } from "../models/admin.js";
import { Teacher } from "../models/teacher.js";
import { Tuition } from "../models/tuition.js";
import sendEmail from "../utils/smtpFunction.js";
import { RequestFor } from "../models/request.js";

export const registerAdmin = async (req, res) => {
    // getting the data from the request body
    const { uid } = req.params;
    try {
        // finding the user with the uid
        const user = await User.findOne({ uid: uid });
        if (!user) {
            // if user does not exist, return a message
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // creating a new admin object
        const newAdmin = new Admin({ 
            user: user._id,
            uid: uid,
        });
        // save the admin to the database
        await newAdmin.save();
        // update the user's admin property with the newly created admin objectId
        user.admin = newAdmin._id;
        await user.save();
        res.status(201).json({ success: true, message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getPendingTeachers = async (req, res) => {
    const { uid } = req.params;
    try {
        // Find all pending requests where `to` contains the uid and `reasonModel` is 'Teacher'
        const pendingRequests = await RequestFor.find({
            to: uid,
            reasonModel: 'Teacher',
            status: 'Pending'
        }).populate('to').populate('from').populate('reason');

        if (pendingRequests.length === 0) {
            return res.status(404).json({ success: false, message: 'No pending requests found for the specified user' });
        }

        res.status(200).json({ success: true, data: pendingRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        const allTeachers = await Teacher.find();

        res.status(200).json({ success: true, teachers: allTeachers });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const verifyTeacher = async (req, res) => {
    try {
        const { requestId, action } = req.body;
        const request = await RequestFor.findById({ _id: requestId }).populate('from').populate('to');
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.reasonModel !== 'Teacher') {
            return res.status(400).json({ success: false, message: 'Invalid request type' });
        }
        const user = request.from;
        if (action === 'approve') {
            // creating a new teacher object
            const newTeacher = new Teacher({ 
                user: user._id,
                uid: user.uid,
                school: request.reason.school,
                phone: request.reason.phone,
                dateOfBirth: request.reason.dateOfBirth,
                highestQualifications: request.reason.highestQualifications,
                teachingExperience: request.reason.teachingExperience,
                subjects: request.reason.subjects
            });
            // save the new teacher to the database
            await newTeacher.save();
            // update the user's teacher property with the newly created teacher objectId
            user.teacher = newTeacher._id;
            await user.save();
            // delete the request from the database
            await RequestFor.deleteOne({ _id: requestId });
            sendEmail(user.email, 'Your teacher registration has been approved');
            res.status(200).json({ success: true, message: 'Teacher registration approved successfully' });

        } else if (action === 'delete') {
            await RequestFor.deleteOne({ _id: requestId });

            // send email notification
            sendEmail(user.email, 'Your teacher registration request has been rejected');

            res.status(200).json({ success: true, message: 'Teacher registration request deleted successfully' });

        } else {
            res.status(400).json({ success: false, message: 'Invalid action specified' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const removeTeacher = async (req, res) => {
    try {
        const { teacherId } = req.body;

        const teacher = await Teacher.findOne({user: teacherId});

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // also handle the case where the teacher has tuitions --> remove tuitions and teacher in tuitions

        const user = await User.findById(teacher.user);
        await teacher.deleteOne({ user : teacherId });
        sendEmail(user.email, `Your ${user.name} has been removed`);

        return res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getPendingTuitions = async (req, res) => {
    const { uid } = req.params;
    try {
        const pendingRequests = await RequestFor.find({
            to: uid,
            reasonModel: 'Tuition',
            status: 'Pending'
        }).populate('to').populate('from').populate('reason');

        if (pendingRequests.length === 0) {
            return res.status(404).json({ success: false, message: 'No pending requests found for the specified user' });
        }

        res.status(200).json({ success: true, data: pendingRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getAllTuitions = async (req, res) => {
    try {
        // Find all tuitions that are verified
        const allTuitions = await Tuition.find();

        res.status(200).json({ success: true, tuitions: allTuitions });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const verifyTuition = async (req, res) => {
    try {
        const { requestId, action } = req.body;

        const request = await RequestFor.findById({ _id: requestId }).populate('from').populate('to');
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.reasonModel !== 'Tuition') {
            return res.status(400).json({ success: false, message: 'Invalid request type' });
        }
        const teacherId = request.from._id;
        const teacher = await Teacher.findById({ _id: teacherId });
        if (action === 'approve') {
            // creating a new tuition object
            const newTuition = new Tuition({
                owner: teacher._id,
                teachers: [teacher._id],
                subjects: request.reason.subjects,
                name: request.reason.name,
                address: request.reason.address,
                postalCode: request.reason.postalCode,
                coordinates: { lat: request.reason.coordinates.lat, lang: request.reason.coordinates.lang }
            });
            // save the new tuition to the database
            await newTuition.save();
            // update the teachers tuitionOwned array with the newly created tuition objectId
            teacher.tuitionOwned.push(newTuition._id);
            await teacher.save();
            // delete the request from the database
            await RequestFor.deleteOne({ _id: requestId });
            res.status(200).json({ success: true, message: 'Teacher registration approved successfully' });

        } else if (action === 'delete') {
            await RequestFor.deleteOne({ _id: requestId });

            res.status(200).json({ success: true, message: 'Teacher registration request deleted successfully' });

        } else {
            res.status(400).json({ success: false, message: 'Invalid action specified' });
        }

        return res.status(400).json({ success: false, message: 'Invalid action specified' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const removeTuition = async (req, res) => {
    try {
        const { tuitionId } = req.body;

        const tuition = await Tuition.findById({ _id : tuitionId });

        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }

        const owner = await Teacher.findById({ _id : tuition.owner});
        const user = await User.findById(owner.user);
        sendEmail(user.email, `Your tuition account has been ${tuition.isVerified ? 'verified' : 'deleted'}`);

        await tuition.deleteOne({ _id: tuitionId });
        
        // Remove tuition from the teacher's tuitionOwned array
        owner.tuitionOwned = owner.tuitionOwned.filter(tuition => tuition.toString() !== tuitionId);
        await owner.save();

        return res.status(200).json({ success: true, message: 'Tuition deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};