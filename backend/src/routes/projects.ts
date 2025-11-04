import express from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/projects - Get all projects for user
router.get('/', projectController.getProjects);

// GET /api/projects/tree - Get project tree (hierarchical)
router.get('/tree', projectController.getProjectTree);

// GET /api/projects/:id - Get a single project
router.get('/:id', projectController.getProject);

// POST /api/projects - Create a new project
router.post('/', projectController.createProject);

// PUT /api/projects/:id - Update a project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', projectController.deleteProject);

// POST /api/projects/:id/archive - Archive a project
router.post('/:id/archive', projectController.archiveProject);

// POST /api/projects/:id/star - Toggle star
router.post('/:id/star', projectController.toggleStar);

export default router;
