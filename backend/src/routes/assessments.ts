import { Router } from 'express';
import * as assessmentController from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, assessmentController.createAssessment);
router.get('/', authenticate, assessmentController.getAssessments);
router.get('/:id', authenticate, assessmentController.getAssessment);
router.put('/:id', authenticate, assessmentController.updateAssessment);
router.delete('/:id', authenticate, assessmentController.deleteAssessment);
router.post('/:id/publish', authenticate, assessmentController.publishAssessment);
router.post('/:id/share', authenticate, assessmentController.generateShareLink);
router.get('/:id/responses', authenticate, assessmentController.getAssessmentResponses);

export default router;
