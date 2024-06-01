import express from 'express';
import { addTeacher, deleteBatch, getBatcheInfo, getStudents, removeStudent, removeTeacher, toggleEnrolling, updateBatch } from '../controllers/batchController.js';

const router = express.Router();

router.get('/getBatchInfo/:batchId', getBatcheInfo);
router.put('/updateBatch/:batchId', updateBatch);
router.delete('/deleteBatch/:batchId', deleteBatch);
router.put('/toggleEnrolling/:batchId', toggleEnrolling);
router.put('/addTeacher/:batchId', addTeacher);
router.put('/removeTeacher/:batchId', removeTeacher);
router.get('/getStudents/:batchId', getStudents);
router.put('/removeStudent/:batchId', removeStudent);

export default router;