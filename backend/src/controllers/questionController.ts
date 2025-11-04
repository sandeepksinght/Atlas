import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as QuestionModel from '../models/Question';
import * as AssessmentModel from '../models/Assessment';
import { generateQuestionsFromContent } from '../services/openai';
import { questionGenerationQueue, fileProcessingQueue, urlFetchQueue } from '../config/redis';
import * as JobModel from '../models/Job';
import axios from 'axios';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const addQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user!.userId;
    const { question_type, question_text, options, correct_answer, points, order_index } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const question = await QuestionModel.createQuestion(
      assessmentId,
      question_type,
      question_text,
      options,
      correct_answer,
      points || 0,
      order_index,
      true
    );

    res.status(201).json(question);
  } catch (error: any) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { question_type, question_text, options, correct_answer, points, is_required } = req.body;

    const question = await QuestionModel.updateQuestion(
      id,
      question_type,
      question_text,
      options,
      correct_answer,
      points || 0,
      is_required !== false
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error: any) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await QuestionModel.deleteQuestion(id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

export const generateQuestionsFromText = async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user!.userId;
    const { content, numberOfQuestions } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create job
    const job = await JobModel.createJob(userId, 'question-generation');

    // Add to queue
    await questionGenerationQueue.add({
      jobId: job.id,
      assessmentId,
      content,
      assessmentType: assessment.type,
      numberOfQuestions: numberOfQuestions || 10,
    });

    res.status(202).json({ message: 'Question generation started', jobId: job.id });
  } catch (error: any) {
    console.error('Generate questions error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

export const uploadFileForQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user!.userId;

    const assessment = await AssessmentModel.findAssessmentById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const numberOfQuestions = parseInt(req.body.numberOfQuestions) || 10;

    // Create job
    const job = await JobModel.createJob(userId, 'file-processing');

    // Add to queue
    await fileProcessingQueue.add({
      jobId: job.id,
      assessmentId,
      fileContent,
      fileName: req.file.originalname,
      assessmentType: assessment.type,
      numberOfQuestions,
    });

    res.status(202).json({ message: 'File processing started', jobId: job.id });
  } catch (error: any) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
};

export const generateQuestionsFromUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user!.userId;
    const { url, numberOfQuestions } = req.body;

    const assessment = await AssessmentModel.findAssessmentById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Create job
    const job = await JobModel.createJob(userId, 'url-fetch');

    // Add to queue
    await urlFetchQueue.add({
      jobId: job.id,
      assessmentId,
      url,
      assessmentType: assessment.type,
      numberOfQuestions: numberOfQuestions || 10,
    });

    res.status(202).json({ message: 'URL fetching started', jobId: job.id });
  } catch (error: any) {
    console.error('Generate questions from URL error:', error);
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
};

export const uploadMiddleware = upload.single('file');
