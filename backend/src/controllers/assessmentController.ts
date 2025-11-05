import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as AssessmentModel from '../models/Assessment';
import * as QuestionModel from '../models/Question';
import * as ShareLinkModel from '../models/ShareLink';
import * as ResponseModel from '../models/Response';
import * as SummaryModel from '../models/Summary';

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

export const chatAboutResponses = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { question, chatHistory } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responses = await ResponseModel.findResponsesByAssessmentId(id);
    const questions = await QuestionModel.findQuestionsByAssessmentId(id);

    const responsesData = {
      assessment,
      questions,
      responses,
      totalResponses: responses.length,
    };

    const { chatAboutResponses: chatService } = await import('../services/openai');
    const answer = await chatService(responsesData, question, chatHistory || []);

    res.json({ answer });
  } catch (error: any) {
    console.error('Chat about responses error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat request' });
  }
};

export const generateSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { summaryType, customInstructions, saveToDatabase } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responses = await ResponseModel.findResponsesByAssessmentId(id);
    const questions = await QuestionModel.findQuestionsByAssessmentId(id);

    if (responses.length === 0) {
      return res.status(400).json({ error: 'No responses available to summarize' });
    }

    const responsesData = {
      assessment,
      questions,
      responses,
      totalResponses: responses.length,
    };

    const { generateResponsesSummary } = await import('../services/openai');
    const summary = await generateResponsesSummary(
      responsesData,
      summaryType || 'overview',
      customInstructions
    );

    // Save to database if requested
    let savedSummary = null;
    if (saveToDatabase) {
      savedSummary = await SummaryModel.createSummary(
        id,
        summaryType || 'overview',
        customInstructions || null,
        summary,
        userId
      );
    }

    res.json({ summary, savedSummary });
  } catch (error: any) {
    console.error('Generate summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
};

export const checkExistingSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { summaryType } = req.query;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingSummary = await SummaryModel.findLatestSummary(
      id,
      summaryType as string || 'overview'
    );

    res.json({ exists: !!existingSummary, summary: existingSummary });
  } catch (error: any) {
    console.error('Check existing summary error:', error);
    res.status(500).json({ error: 'Failed to check existing summary' });
  }
};

export const getSummaryVersions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { summaryType } = req.query;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const versions = await SummaryModel.findSummaryVersions(
      id,
      summaryType as string || 'overview'
    );

    res.json(versions);
  } catch (error: any) {
    console.error('Get summary versions error:', error);
    res.status(500).json({ error: 'Failed to get summary versions' });
  }
};

export const getAllSummaries = async (req: AuthRequest, res: Response) => {
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

    const summaries = await SummaryModel.findSummariesByAssessmentId(id);

    res.json(summaries);
  } catch (error: any) {
    console.error('Get all summaries error:', error);
    res.status(500).json({ error: 'Failed to get summaries' });
  }
};
