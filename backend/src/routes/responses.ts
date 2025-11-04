import { Router } from 'express';
import * as responseController from '../controllers/responseController';

const router = Router();

// Public routes (no authentication required)
router.get('/public/:token', responseController.getAssessmentByToken);
router.post('/public/:token/submit', responseController.submitResponse);

export default router;
