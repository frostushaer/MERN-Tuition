import { Tuition } from "../models/tuition.js";
import { Teacher } from "../models/teacher.js";
import { Batch } from "../models/batch.js";
import { Student } from "../models/student.js";

export const getTuitionInfo = async (req, res) => {
    const { tuitionId } = req.params;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId }).populate('batches');
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        res.status(200).json({ success: true, tuition });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTuition = async (req, res) => {
    const { tuitionId } = req.params;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }

        tuition.subjects = req.body.subjects || tuition.subjects;
        tuition.name = req.body.name || tuition.name;
        tuition.address = req.body.address || tuition.address;
        tuition.postalCode = req.body.postalCode || tuition.postalCode;
        tuition.coordinates = {
            lat : req.body.lat || tuition.coordinates.lat,
            lang : req.body.lang || tuition.coordinates.lang
        }
        tuition.imageUrl = req.body.imageUrl || tuition.imageUrl;
        tuition.description = req.body.description || tuition.description;
        tuition.fees = req.body.fees || tuition.fees;
        tuition.rating = req.body.rating || tuition.rating;

        await tuition.save();
        res.status(200).json({ success: true, message: 'Tuition updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptTeacherRequest = async (req, res) => {
    const { tuitionId, teacherId, action } = req.body;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        if (action === 'toggle') {
            // Check if the teacher is in the pendingTeachers array
            if (!tuition.pendingTeachers.includes(teacherId)) {
                return res.status(400).json({ success: false, message: 'Teacher is not in the pending list' });
            }
            // Remove the teacher from pendingTeachers array and add to teachers array
            tuition.pendingTeachers = tuition.pendingTeachers.filter(id => id.toString() !== teacherId);
            tuition.teachers.push(teacherId);
            await tuition.save();
            // Update the teacher's tuitionJoined array
            const teacher = await Teacher.findById(teacherId);
            teacher.tuitionJoined.push(tuitionId);
            await teacher.save();
            
            return res.status(200).json({ success: true, message: 'Teacher accepted successfully' });
        } else if (action === 'delete') {
            // Remove the teacher from pendingTeachers array
            tuition.pendingTeachers = tuition.pendingTeachers.filter(id => id.toString() !== teacherId);
            await tuition.save();
            return res.status(200).json({ success: true, message: 'Teacher request deleted successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action specified' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeTeacher = async (req, res) => {
    const { tuitionId, teacherId } = req.body;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        // Check if the teacher is in the teachers array
        if (!tuition.teachers.includes(teacherId)) {
            return res.status(400).json({ success: false, message: 'Teacher is not part of this tuition' });
        }
        // Remove the teacher from the teachers array
        tuition.teachers = tuition.teachers.filter(id => id.toString() !== teacherId);

        // Remove the tuition from the teacher's tuitionJoined array
        const teacher = await Teacher.findById(teacherId);
        teacher.tuitionJoined = teacher.tuitionJoined.filter(id => id.toString() !== tuitionId);

        await tuition.save();
        await teacher.save();

        res.status(200).json({ success: true, message: 'Teacher removed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTeachers = async (req, res) => {
    const { tuitionId } = req.params;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId }).populate('teachers', 'user');;
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        const teachers = await Teacher.find({ _id: { $in: tuition.teachers } }).populate('user', 'name email');
        res.status(200).json({ success: true, teachers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBatch = async (req, res) => {
    const { tuitionId } = req.params;
    try {
        const { name, description, subject, schedule: { day, startTime }, fee } = req.body;
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        // Ensure the tuition owner is included in the teachers array
        let teachers = tuition.teachers;
        const owner = tuition.owner.toString();
        let updatedTeachers = teachers.map(id => id.toString());
        if (!updatedTeachers.includes(owner)) {
            updatedTeachers.push(owner);
        }
        const newBatch = new Batch({
            tuition: tuitionId,
            teachers: updatedTeachers,
            name,
            description,
            subject,
            schedule: { day, startTime },
            fee,
        });
        await newBatch.save();
        // Add the new batch to the tuition's batches array
        tuition.batches.push(newBatch._id);
        await tuition.save();
        // Add the new batch to each teacher's batches array
        for (let teacherId of updatedTeachers) {
            const teacher = await Teacher.findById(teacherId);
            if (teacher) {
                teacher.batchAssigned.push(newBatch._id);
                await teacher.save();
            }
        }
        res.status(201).json({ success: true, message: 'Batch created successfully', batch: newBatch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBatches = async (req, res) => {
    const { tuitionId } = req.params;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        const batches = await Batch.find({ tuition: tuitionId });
        res.status(200).json({ success: true, batches });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudents = async (req, res) => {
    const { tuitionId } = req.params;
    try {
        const tuition = await Tuition.findOne({ _id: tuitionId });
        if (!tuition) {
            return res.status(404).json({ success: false, message: 'Tuition not found' });
        }
        // const students = await Student.find({ _id: { $in: tuition.students } });
        const students = tuition.students;
        res.status(200).json({ success: true, students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};