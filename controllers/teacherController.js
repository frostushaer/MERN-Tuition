import { User } from "../models/user.js";
import { Teacher } from "../models/teacher.js";
import sendEmail from "../utils/smtpFunction.js";
import { Tuition } from "../models/tuition.js";

export const registerTeacher = async (req, res) => {
    // getting the data from the request body
    const { school, phone, dateOfBirth, highestQualifications, teachingExperience, subjects } = req.body;
    const { uid } = req.params;
    try {
        // finding the user with the uid
        const user = await User.findOne({ uid: uid });
        if (!user) {
            // if user does not exist, return a message
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // creating a new teacher object
        const newTeacher = new Teacher({ 
            user: user._id,
            uid: uid,
            school: school,
            phone: phone,
            dateOfBirth: dateOfBirth,
            highestQualifications: highestQualifications,
            teachingExperience: teachingExperience,
            subjects: subjects
        });
        // save the teacher to the database
        await newTeacher.save();
        // update the user's teacher property with the newly created teacher objectId
        user.teacher = newTeacher._id;
        await user.save();
        sendEmail(user.email, 'Teacher Registration Request Sent');
        res.status(201).json({ success: true, message: 'Teacher created successfully' });
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
    try {
        // finding the teacher associated with the user
        const teacher = await Teacher.findOne({ uid: uid });
        if (!teacher) {
            // if teacher does not exist, return a message
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        // get the tuition details from the request body
        const { subjects, name, address, postalCode, coordinates: {lat, lang} } = req.body;
        // create a new tuition object
        const newTuition = new Tuition({
            owner: teacher._id,
            teachers: [teacher._id],
            subjects: subjects,
            name: name,
            address: address,
            postalCode: postalCode,
            coordinates: {lat: lat, lang: lang}
        });
        // save the new tuition to the database
        await newTuition.save();
        
        res.status(201).json({ success: true, message: 'Tuition applied successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};