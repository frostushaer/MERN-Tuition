import express from 'express';
import { getUnverifiedTeachers, getUnverifiedTuitions, getVerifiedTeachers, getVerifiedTuitions, registerAdmin, verifyTeacher, verifyTuition } from '../controllers/adminController.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

router.post('/:uid', registerAdmin);

router.get('/getVerifiedTeachers',  getVerifiedTeachers);
router.get('/getUnverifiedTeachers',  getUnverifiedTeachers);
router.put('/verifyTeacher',  verifyTeacher);

router.get('/getVerifiedTuitions', getVerifiedTuitions);
router.get('/getUnverifiedTuitions', getUnverifiedTuitions);
router.put('/verifyTuition', verifyTuition);

export default router;