import { Request, Response } from 'express';
import { Template } from '../models/template';
import * as Assessment from '../models/Assessment';
import * as Question from '../models/Question';

export const templateController = {
  // Get all templates (system + user's templates)
  async getTemplates(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const templates = await Template.findAll(userId);
      res.json(templates);
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Get templates by category
  async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const userId = req.user?.userId;
      const templates = await Template.findByCategory(category, userId);
      res.json(templates);
    } catch (error) {
      console.error('Get templates by category error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Get a single template
  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      console.error('Get template error:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  },

  // Create assessment from template
  async createFromTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Increment usage count
      await Template.incrementUsage(id);

      // Parse the template data
      const templateData = typeof template.assessment_data === 'string'
        ? JSON.parse(template.assessment_data)
        : template.assessment_data;

      // Create new assessment from template
      const assessment = await Assessment.createAssessment(
        userId,
        templateData.title || template.name,
        templateData.description || template.description || '',
        templateData.type || 'quiz',
        templateData.settings || {},
        null // project_id
      );

      // Create all questions from template
      if (templateData.questions && Array.isArray(templateData.questions)) {
        for (const questionData of templateData.questions) {
          await Question.createQuestion({
            assessment_id: assessment.id,
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            options: questionData.options || null,
            correct_answer: questionData.correct_answer || null,
            points: questionData.points || 1,
            explanation: questionData.explanation || null,
            order_num: questionData.order_num || 0,
          });
        }
      }

      // Return the newly created assessment
      res.json({ id: assessment.id, ...assessment });
    } catch (error) {
      console.error('Create from template error:', error);
      res.status(500).json({ error: 'Failed to create from template' });
    }
  },

  // Save assessment as template
  async createTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, description, category, is_public, thumbnail_url, assessment_data, tags } = req.body;

      if (!name || !assessment_data) {
        return res.status(400).json({ error: 'Name and assessment_data are required' });
      }

      const template = await Template.create({
        user_id: userId,
        name,
        description,
        category,
        is_public,
        thumbnail_url,
        assessment_data,
        tags,
      });

      res.status(201).json(template);
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  },

  // Update a template
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Only allow updates to own templates
      if (template.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedTemplate = await Template.update(id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  },

  // Delete a template
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Only allow deletion of own templates
      if (template.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Template.delete(id);
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  },

  // Search templates
  async searchTemplates(req: Request, res: Response) {
    try {
      const { q } = req.query;
      const userId = req.user?.userId;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const templates = await Template.search(q, userId);
      res.json(templates);
    } catch (error) {
      console.error('Search templates error:', error);
      res.status(500).json({ error: 'Failed to search templates' });
    }
  },

  // Get popular templates
  async getPopularTemplates(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const templates = await Template.getPopular(limit);
      res.json(templates);
    } catch (error) {
      console.error('Get popular templates error:', error);
      res.status(500).json({ error: 'Failed to fetch popular templates' });
    }
  },
};
