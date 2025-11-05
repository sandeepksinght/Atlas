import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as AssessmentModel from '../models/Assessment';
import * as QuestionModel from '../models/Question';
import * as ShareLinkModel from '../models/ShareLink';
import * as ResponseModel from '../models/Response';

export const createAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, type, settings, project_id } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const assessment = await AssessmentModel.createAssessment(
      userId,
      title,
      description || '',
      type,
      settings || {},
      project_id || null
    );

    res.status(201).json(assessment);
  } catch (error: any) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
};

export const getAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const assessments = await AssessmentModel.findAssessmentsByUserId(userId);

    res.json(assessments);
  } catch (error: any) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
};

export const getAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const questions = await QuestionModel.findQuestionsByAssessmentId(id);

    res.json({
      ...assessment,
      questions,
    });
  } catch (error: any) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to get assessment' });
  }
};

export const updateAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description, settings } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await AssessmentModel.updateAssessment(id, title, description, settings);

    res.json(updated);
  } catch (error: any) {
    console.error('Update assessment error:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
};

export const deleteAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await AssessmentModel.deleteAssessment(id);

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error: any) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
};

export const publishAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await AssessmentModel.publishAssessment(id);

    res.json(updated);
  } catch (error: any) {
    console.error('Publish assessment error:', error);
    res.status(500).json({ error: 'Failed to publish assessment' });
  }
};

export const generateShareLink = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { expiresAt } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!assessment.is_published) {
      return res.status(400).json({ error: 'Assessment must be published before sharing' });
    }

    const shareLink = await ShareLinkModel.createShareLink(
      id,
      expiresAt ? new Date(expiresAt) : null
    );

    res.status(201).json(shareLink);
  } catch (error: any) {
    console.error('Generate share link error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

export const getAssessmentResponses = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responses = await ResponseModel.findResponsesByAssessmentId(id);

    res.json(responses);
  } catch (error: any) {
    console.error('Get assessment responses error:', error);
    res.status(500).json({ error: 'Failed to get assessment responses' });
  }
};
