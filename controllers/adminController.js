import { User } from "../models/user.js";
import { Admin } from "../models/admin.js";
import { Teacher } from "../models/teacher.js";
import { Tuition } from "../models/tuition.js";
import sendEmail from "../utils/smtpFunction.js";

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

export const getUnverifiedTeachers = async (req, res) => {
    try {
        // Find all teachers that are unverified
        const unverifiedTeachers = await Teacher.find({ isVerified: false });

        res.status(200).json({ success: true, teachers: unverifiedTeachers });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getVerifiedTeachers = async (req, res) => {
    try {
        // Find all teachers that are verified
        const verifiedTeachers = await Teacher.find({ isVerified: true });

        res.status(200).json({ success: true, teachers: verifiedTeachers });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const verifyTeacher = async (req, res) => {
    try {
        // change based on frontend
        const { teacherId, action } = req.body;

        const teacher = await Teacher.findOne({ user: teacherId });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        if (action === 'toggle') {
            teacher.isVerified = !teacher.isVerified;
            await teacher.save();

            const user = await User.findById(teacher.user);
            sendEmail(user.email, `Your teacher account has been ${teacher.isVerified ? 'verified' : 'removed'}`);
            return res.status(200).json({ success: true, message: 'Teacher verification status toggled' });
        }
        if (action === 'delete') {
            const user = await User.findById(teacher.user);
            await teacher.deleteOne({ user: teacherId });
            sendEmail(user.email, `Your teacher account has been ${teacher.isVerified ? 'verified' : 'removed'}`);
            return res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
        }

        return res.status(400).json({ success: false, message: 'Invalid action specified' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getUnverifiedTuitions = async (req, res) => {
    try {
        // Find all tuitions that are unverified
        const unverifiedTuitions = await Tuition.find({ isVerified: false });

        res.status(200).json({ success: true, tuitions: unverifiedTuitions });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const getVerifiedTuitions = async (req, res) => {
    try {
        // Find all tuitions that are verified
        const verifiedTuitions = await Tuition.find({ isVerified: true });

        res.status(200).json({ success: true, tuitions: verifiedTuitions });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

export const verifyTuition = async (req, res) => {
    try {
        // change based on frontend
        const { tuitionId, action } = req.body;

        const tuition = await Tuition.findById(tuitionId);

        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        if (action === 'toggle') {

            tuition.isVerified = !tuition.isVerified;
            await tuition.save();
            
            // if tuition is verified, add the tuition to the teacher's tuitionOwned array
            const owner = await Teacher.findById(tuition.owner);
            owner.tuitionOwned.push(tuition._id);
            await owner.save();

            const user = await User.findById(owner.user);
            sendEmail(user.email, `Your tuition account has been ${tuition.isVerified ? 'verified' : 'deleted'}`);

            return res.status(200).json({ success: true, message: 'Tuition verification status toggled' });
        }
        if (action === 'delete') {
            const owner = await Teacher.findById(tuition.owner);
            const user = await User.findById(owner.user);
            sendEmail(user.email, `Your tuition account has been ${tuition.isVerified ? 'verified' : 'deleted'}`);
            await tuition.deleteOne({ _id: tuitionId });
            return res.status(200).json({ success: true, message: 'Tuition deleted successfully' });
        }

        return res.status(400).json({ success: false, message: 'Invalid action specified' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};