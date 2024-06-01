import { Batch } from "../models/batch.js";
import { Tuition } from "../models/tuition.js";
import { Teacher } from "../models/teacher.js";
import { Student } from "../models/student.js";

export const getBatcheInfo = async (req, res) => {
    const { batchId } = req.params;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({ success: true, batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBatch = async (req, res) => {
    const { batchId } = req.params;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        batch.name = req.body.name || batch.name;
        batch.description = req.body.description || batch.description;
        batch.subject = req.body.subject || batch.subject;
        if (req.body.schedule) {
            batch.schedule = req.body.schedule.map(item => ({
                day: item.day,
                startTime: item.startTime
            }));
        }
        batch.fee = req.body.fee || batch.fee;

        await batch.save();
        res.status(200).json({ success: true, message: 'Batch updated successfully', batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBatch = async (req, res) => {
    const { batchId } = req.params;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        // Remove the batch from the tuition's batches array
        await Tuition.updateOne({ _id: batch.tuition }, { $pull: { batches: batch._id } });
        // Remove the batch from each teacher's batches array
        for (let teacherId of batch.teachers) {
            await Teacher.updateOne({ _id: teacherId }, { $pull: { batches: batch._id } });
        }
        // Remove the batch itself
        await batch.deleteOne();
        res.status(200).json({ success: true, message: 'Batch removed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleEnrolling = async (req, res) => {
    const { batchId } = req.params;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        batch.enrolling = !batch.enrolling;
        await batch.save();
        res.status(200).json({ success: true, message: 'Enrolling status updated successfully', batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addTeacher = async (req, res) => {
    const { batchId } = req.params;
    const { teacherId } = req.body;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        // Check if the teacher is in the same tuition as the batch
        const teacher = await Teacher.findOne({ _id: teacherId, tuitionJoined: batch.tuition });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found in tuition' });
        }
        // Check if the teacher is already assigned to the batch
        if (batch.teachers.includes(teacherId)) {
            return res.status(400).json({ success: false, message: 'Teacher already assigned to this batch' });
        }
        // Add the teacher to the batch
        batch.teachers.push(teacherId);
        await batch.save();

        // Add the batch to the teacher's batches array
        teacher.batchAssigned.push(batchId);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Teacher added to batch successfully', batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeTeacher = async (req, res) => {
    const { batchId } = req.params;
    const { teacherId } = req.body;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        const teacher = await Teacher.findOne({ _id: teacherId });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        // Check if the teacher is assigned to the batch
        if (!batch.teachers.some(id => id.toString() === teacherId.toString())) {
            return res.status(400).json({ success: false, message: 'Teacher not assigned to this batch' });
        }

        // Remove the teacher from the batch
        batch.teachers = batch.teachers.filter(id => id.toString() !== teacherId.toString());

        // Remove the batch from the teacher's batches array
        teacher.batchAssigned = teacher.batchAssigned.filter(id => id.toString() !== batchId.toString());

        await batch.save();
        await teacher.save();

        res.status(200).json({ success: true, message: 'Teacher removed from batch successfully' });

    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudents = async (req, res) => {
    const { batchId } = req.params;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        // const students = await Student.find({ _id: { $in: batch.students } });
        const students = batch.students;
        res.status(200).json({ success: true, students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeStudent = async (req, res) => {
    const { batchId } = req.params;
    const { uid, studentId } = req.body;
    try {
        const batch = await Batch.findOne({ _id: batchId });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        // Check if the user is a teacher in the batch
        if (!batch.teachers.includes(uid)) {
            return res.status(400).json({ success: false, message: 'User is not a teacher in this batch' });
        }
        // Find the student in the batch
        const studentInBatch = batch.students.find(id => id.toString() === studentId.toString());
        if (!studentInBatch) {
            return res.status(404).json({ success: false, message: 'Student not found in this batch' });
        }
        const student = await Student.findOne ({ _id: studentId });
        // Remove the student from batch.students
        batch.students = batch.students.filter(id => id.toString() !== studentId.toString());
        // Remove the student from tuition.students
        await Tuition.updateOne({ _id: batch.tuition }, { $pull: { students: studentId } });
        
        // Remove the batch and tuition from student.enrolledBatches[] and student.enrolledTuitions[]
        student.enrolledBatches = student.enrolledBatches.filter(id => id.toString() !== batchId.toString());
        student.enrolledTuitions = student.enrolledTuitions.filter(id => id.toString() !== batch.tuition.toString());

        await batch.save();
        await student.save();

        res.status(200).json({ success: true, message: 'Student removed from batch successfully' });

    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};