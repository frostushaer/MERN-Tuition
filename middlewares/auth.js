import { User } from "../models/user.js";
import { Tuition } from "../models/tuition.js";
import { Teacher } from "../models/teacher.js";

export const isAdmin = async (req, res, next) => {
  const { uid } = req.params;
  // const { uid } = req.user; // req.user contains the authenticated user's UID
  try {
    const user = await User.findOne({ uid });
    if (user && user.type === 'Admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const isTeacher = async (req, res, next) => {
  const { uid } = req.params;
  // const { uid } = req.user;
  try {
    const user = await User.findOne({ uid });
    if (user && user.type === 'Teacher') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Teachers only' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const isTutionOwner = async (req, res, next) => {
  const { uid, tuitionId } = req.params;
  // const { uid } = req.user;
  try {
    const teacher = await Teacher.findOne({ uid });
    const tuition = await Tuition.findOne({ _id: tuitionId });
    if (!tuition) {
      return res.status(404).json({ success: false, message: 'Tuition not found' });
    }

    // Check if the tuition owner includes the teacher's ID
    if (!tuition.owner.includes(teacher._id.toString())) {
        return res.status(403).json({ success: false, message: 'User is not the owner of this tuition' });
    }

    // If the user is the owner, proceed to the next middleware or route handler
    next();
  }
  catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const isStudent = async (req, res, next) => {
  const { uid } = req.params;
  // const { uid } = req.user;
  try {
    const user = await User.findOne({ uid });
    if (user && user.type === 'Student') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Students only' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
