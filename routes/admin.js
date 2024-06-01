import express from 'express';
import { getAllTeachers, getAllTuitions, getPendingTeachers, getPendingTuitions, registerAdmin, removeTeacher, removeTuition, verifyTeacher, verifyTuition } from '../controllers/adminController.js';
import { isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

router.post('/:uid', registerAdmin);

router.get('/getPendingTeachers/:uid',  getPendingTeachers);   
router.get('/getAllTeachers',  getAllTeachers);
router.put('/verifyTeacher',  verifyTeacher);
router.delete('/removeTeacher',  removeTeacher);

router.get('/getPendingTuitions/:uid', getPendingTuitions);
router.get('/getAllTuitions', getAllTuitions);
router.put('/verifyTuition', verifyTuition);
router.delete('/removeTuition', removeTuition);

export default router;