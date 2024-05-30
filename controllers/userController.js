import { User } from "../models/user.js";

export const registerUser = async (req, res) => {
    // getting the data from the request body
    const { name, email, uid } = req.body;
    const { type } = req.params;
    // getting the image url from the request file
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    
    try {
        // checking if the user already exists
        const user = await User.findOne({ uid: uid });
        if (user) {
            // if user exists, return a message
            return res.status(200).json({ success: true, message: 'User already exists' });
        }

        // creating a new user object
        const newUser = new User({ 
            name: name,
            email: email,
            uid: uid,
            imageUrl: imageUrl,
            type: type
        });
        // save the user to the database
        await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: `${error.message}` });
    }
};

