import express from 'express';
import { registerStudent } from '../controllers/studentController.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

// we will use authentication middleware in the future (but for now use /:uid)
router.post('/:uid', registerStudent);

export default router;