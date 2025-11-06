import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as QuestionModel from '../models/Question';
import * as AssessmentModel from '../models/Assessment';
import { generateQuestionsFromContent } from '../services/openai';
import { questionGenerationQueue, fileProcessingQueue, urlFetchQueue } from '../config/redis';
import * as JobModel from '../models/Job';
import axios from 'axios';
import multer from 'multer';
import { extractTextFromDocument, isSupportedFormat, isFormRecognizerConfigured } from '../services/formRecognizer';

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
    const { content, numberOfQuestions, questionTypes } = req.body;

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
      questionTypes: questionTypes || undefined,
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

    const fileName = req.file.originalname;
    const numberOfQuestions = parseInt(req.body.numberOfQuestions) || 10;
    const extractMode = req.body.extractMode === 'true';
    const questionTypes = req.body.questionTypes ? JSON.parse(req.body.questionTypes) : undefined;

    // Check if file format is supported by Form Recognizer
    if (!isSupportedFormat(fileName)) {
      return res.status(400).json({
        error: 'Unsupported file format. Supported formats: PDF, PNG, JPG, JPEG, TIFF, BMP, DOCX, XLSX, PPTX'
      });
    }

    // Check if Form Recognizer is configured
    if (!isFormRecognizerConfigured()) {
      // Fallback to simple text extraction for plain text files
      if (fileName.endsWith('.txt')) {
        const fileContent = req.file.buffer.toString('utf-8');

        const job = await JobModel.createJob(userId, 'file-processing');
        await fileProcessingQueue.add({
          jobId: job.id,
          assessmentId,
          fileContent,
          fileName,
          assessmentType: assessment.type,
          numberOfQuestions,
          extractMode,
          questionTypes,
        });

        return res.status(202).json({ message: 'File processing started', jobId: job.id });
      }

      return res.status(503).json({
        error: 'Azure Form Recognizer is not configured. Please set FORM_RECOGNIZER_ENDPOINT and FORM_RECOGNIZER_KEY.'
      });
    }

    console.log(`Processing file: ${fileName} (${req.file.size} bytes)`);

    // Extract text using Azure Form Recognizer
    let fileContent: string;
    try {
      const extracted = await extractTextFromDocument(req.file.buffer, fileName);
      fileContent = extracted.text;

      // If tables are present, append them in a readable format
      if (extracted.tables && extracted.tables.length > 0) {
        fileContent += '\n\n--- Tables ---\n';
        extracted.tables.forEach((table, index) => {
          fileContent += `\nTable ${index + 1} (${table.rowCount}x${table.columnCount}):\n`;

          // Convert table cells to a grid format
          const grid: string[][] = Array(table.rowCount).fill(null).map(() => Array(table.columnCount).fill(''));
          table.cells.forEach(cell => {
            grid[cell.rowIndex][cell.columnIndex] = cell.content;
          });

          // Format as markdown-style table
          grid.forEach(row => {
            fileContent += row.join(' | ') + '\n';
          });
        });
      }

      console.log(`Successfully extracted ${fileContent.length} characters from ${fileName}`);
    } catch (extractError: any) {
      console.error('Azure Form Recognizer extraction error:', extractError);
      return res.status(500).json({
        error: `Failed to extract text from document: ${extractError.message}`
      });
    }

    // Create job
    const job = await JobModel.createJob(userId, 'file-processing');

    // Add to queue with extracted content
    await fileProcessingQueue.add({
      jobId: job.id,
      assessmentId,
      fileContent,
      fileName,
      assessmentType: assessment.type,
      numberOfQuestions,
      extractMode,
      questionTypes,
    });

    res.status(202).json({
      message: 'File processing started',
      jobId: job.id,
      extractedLength: fileContent.length
    });
  } catch (error: any) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
};

export const generateQuestionsFromUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user!.userId;
    const { url, numberOfQuestions, questionTypes } = req.body;

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
      questionTypes: questionTypes || undefined,
    });

    res.status(202).json({ message: 'URL fetching started', jobId: job.id });
  } catch (error: any) {
    console.error('Generate questions from URL error:', error);
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
};

export const uploadMiddleware = upload.single('file');
