import { Router } from 'express';
import * as jobController from '../controllers/jobController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, jobController.getUserJobs);
router.get('/:id', authenticate, jobController.getJob);

export default router;
