import express from 'express';
import { getAllTuitions, getEnrolledBatches, registerStudent, requestBatchJoin } from '../controllers/studentController.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

// we will use authentication middleware in the future (but for now use /:uid)
router.post('/:uid', registerStudent);
router.get('/getAllTuitions', getAllTuitions);
router.post('/requestBatchJoin/:uid', requestBatchJoin);
router.get('/getEnrolledBatches/:uid', getEnrolledBatches);

export default router;