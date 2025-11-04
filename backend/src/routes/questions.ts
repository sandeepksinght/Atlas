import { Router } from 'express';
import * as questionController from '../controllers/questionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:assessmentId/questions', authenticate, questionController.addQuestion);
router.put('/questions/:id', authenticate, questionController.updateQuestion);
router.delete('/questions/:id', authenticate, questionController.deleteQuestion);
router.post('/:assessmentId/generate-from-text', authenticate, questionController.generateQuestionsFromText);
router.post('/:assessmentId/generate-from-file', authenticate, questionController.uploadMiddleware, questionController.uploadFileForQuestions);
router.post('/:assessmentId/generate-from-url', authenticate, questionController.generateQuestionsFromUrl);

export default router;
