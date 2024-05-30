import { User } from "../models/user.js";
import { Student } from "../models/student.js";

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
