import express from 'express';
import { applyForTuition, registerTeacher, updateTeacher } from '../controllers/teacherController.js';
import { isTeacher } from '../middlewares/auth.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

// we will use authentication middleware in the future (but for now use /:uid)
router.post('/:uid', registerTeacher);

router.put('/:uid', isTeacher, updateTeacher);

router.post('/applyForTuition/:uid', isTeacher, applyForTuition);

export default router;