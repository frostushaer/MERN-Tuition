import express from 'express';
import { registerUser } from '../controllers/userController.js';
import uploadCloud from '../utils/cloudinary.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

router.post('/:type', uploadCloud.single('imageUrl'), registerUser);

export default router;