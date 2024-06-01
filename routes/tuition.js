import express from 'express';
import { acceptTeacherRequest, createBatch, getBatches, getStudents, getTeachers, getTuitionInfo, removeTeacher, updateTuition } from '../controllers/tuitionController.js';

const router = express.Router();

router.put('/updateTuition/:tuitionId', updateTuition);
router.get('/getTuitionInfo/:tuitionId', getTuitionInfo);
router.put('/acceptTeacherRequest', acceptTeacherRequest);
router.put('/removeTeacher', removeTeacher);
router.get('/getTeachers/:tuitionId', getTeachers);
router.post('/createBatch/:tuitionId', createBatch);
router.get('/getBatches/:tuitionId', getBatches);
router.get('/getStudents/:tuitionId', getStudents);

export default router;