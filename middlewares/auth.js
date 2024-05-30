import { User } from "../models/user.js";

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
