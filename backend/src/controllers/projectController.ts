import { Request, Response } from 'express';
import { Project } from '../models/project';

export const projectController = {
  // Get all projects for the authenticated user
  async getProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const projects = await Project.findByUserId(userId);
      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  },

  // Get project tree (hierarchical structure)
  async getProjectTree(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tree = await Project.getTree(userId);
      res.json(tree);
    } catch (error) {
      console.error('Get project tree error:', error);
      res.status(500).json({ error: 'Failed to fetch project tree' });
    }
  },

  // Get a single project
  async getProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  },

  // Create a new project
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, description, color, icon, parent_id, position } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const project = await Project.create({
        user_id: userId,
        name,
        description,
        color,
        icon,
        parent_id,
        position,
      });

      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  },

  // Update a project
  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Verify ownership
      const existingProject = await Project.findById(id);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (existingProject.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { name, description, color, icon, parent_id, position, is_starred, is_archived } = req.body;

      const updatedProject = await Project.update(id, {
        name,
        description,
        color,
        icon,
        parent_id,
        position,
        is_starred,
        is_archived,
      });

      res.json(updatedProject);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  },

  // Delete a project
  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Verify ownership
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (project.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Project.delete(id);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  },

  // Archive a project
  async archiveProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Verify ownership
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (project.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const archivedProject = await Project.archive(id);
      res.json(archivedProject);
    } catch (error) {
      console.error('Archive project error:', error);
      res.status(500).json({ error: 'Failed to archive project' });
    }
  },

  // Toggle star
  async toggleStar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Verify ownership
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (project.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedProject = await Project.toggleStar(id);
      res.json(updatedProject);
    } catch (error) {
      console.error('Toggle star error:', error);
      res.status(500).json({ error: 'Failed to toggle star' });
    }
  },
};
