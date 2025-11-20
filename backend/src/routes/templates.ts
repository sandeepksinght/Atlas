import express from 'express';
import { templateController } from '../controllers/templateController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/popular', templateController.getPopularTemplates);
router.get('/search', templateController.searchTemplates);
router.get('/category/:category', templateController.getTemplatesByCategory);
router.get('/:id', templateController.getTemplate);

// Protected routes (authentication required)
router.use(authenticate);

router.get('/', templateController.getTemplates);
router.post('/', templateController.createTemplate);
router.post('/:id/use', templateController.createFromTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
