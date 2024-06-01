import express from 'express';
import { acceptBatchJoinRequest, applyForTuition, getAssignedBatches, getEnrolledTuitions, getOwnedTuition, getRequests, registerTeacher, requestToJoinTuition, updateTeacher } from '../controllers/teacherController.js';

const router = express.Router();

// we will use tins middleware after frontend is ready
// router.use(firebaseAuth);

// we will use authentication middleware in the future (but for now use /:uid)
router.post('/:uid', registerTeacher);

router.put('/:uid', updateTeacher);

router.post('/applyForTuition/:uid', applyForTuition);

router.post('/requestToJoinTuition/:uid', requestToJoinTuition);
router.get('/getOwnedtuition/:uid', getOwnedTuition);
router.get('/getEnrolledTuitions/:uid', getEnrolledTuitions);
router.get('/getAssignedBatches/:uid', getAssignedBatches);

router.get('/getRequests/:uid', getRequests);
router.put('/acceptBatchJoinRequest/:teacherId', acceptBatchJoinRequest);

export default router;