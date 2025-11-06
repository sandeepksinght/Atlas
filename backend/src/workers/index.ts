import dotenv from 'dotenv';
import { questionGenerationQueue, fileProcessingQueue, urlFetchQueue } from '../config/redis';
import { generateQuestionsFromContent } from '../services/openai';
import * as QuestionModel from '../models/Question';
import * as JobModel from '../models/Job';
import axios from 'axios';

dotenv.config();

console.log('Starting worker processes...');

// Question generation worker
questionGenerationQueue.process(async (job) => {
  console.log(`Processing question generation job: ${job.id}`);

  try {
    const { jobId, assessmentId, content, assessmentType, numberOfQuestions, questionTypes } = job.data;

    // Update job status
    await JobModel.updateJobStatus(jobId, 'processing');

    // Generate questions using OpenAI
    const generatedQuestions = await generateQuestionsFromContent(
      content,
      assessmentType,
      numberOfQuestions,
      questionTypes
    );

    // Add questions to database
    const questionsToCreate = generatedQuestions.map((q, index) => ({
      assessment_id: assessmentId,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points || 0,
      order_index: index,
      is_required: true,
    }));

    const createdQuestions = await QuestionModel.createQuestions(questionsToCreate);

    // Update job with result
    await JobModel.updateJobStatus(jobId, 'completed', {
      questions: createdQuestions,
      count: createdQuestions.length,
    });

    console.log(`Question generation job ${job.id} completed successfully`);
  } catch (error: any) {
    console.error(`Question generation job ${job.id} failed:`, error);

    // Update job with error
    await JobModel.updateJobStatus(
      job.data.jobId,
      'failed',
      undefined,
      error.message
    );

    throw error;
  }
});

// Helper function to extract questions from document text
function extractQuestionsFromText(text: string): any[] {
  const questions: any[] = [];

  // Split by question markers (Q1, Q2, etc. or 1., 2., etc.)
  const questionRegex = /(?:^|\n)(?:Q\.?\s*)?(\d+)[\.\)]\s*(.+?)(?=(?:\n(?:Q\.?\s*)?\d+[\.\)]|\n(?:Answer|A)[:：]|$))/gis;
  const matches = [...text.matchAll(questionRegex)];

  matches.forEach((match, index) => {
    const questionText = match[2].trim();

    // Try to find answer for this question
    const answerRegex = new RegExp(`(?:Answer|A)\\s*${match[1]}?[:：]\\s*(.+?)(?=\\n(?:Q\\.?\\s*)?\\d+[\\.\)]|\\n(?:Answer|A)|$)`, 'is');
    const answerMatch = text.match(answerRegex);
    const correctAnswer = answerMatch ? answerMatch[1].trim() : null;

    // Try to extract options if present (A), B), C), etc.)
    const optionsRegex = /[A-D][\.\)]\s*(.+?)(?=\n[A-D][\.\)]|\n(?:Answer|Q)|$)/gi;
    const optionMatches = [...questionText.matchAll(optionsRegex)];
    const options = optionMatches.map(m => m[1].trim());

    // Determine question type
    let questionType = 'short_answer';
    if (options.length > 0) {
      questionType = options.length > 1 ? 'single_choice' : 'short_answer';
    } else if (questionText.toLowerCase().includes('true or false') ||
               questionText.toLowerCase().includes('true/false')) {
      questionType = 'true_false';
    }

    questions.push({
      question_text: questionText.replace(optionsRegex, '').trim(),
      question_type: questionType,
      options: options.length > 0 ? options : null,
      correct_answer: correctAnswer,
      points: 1,
    });
  });

  return questions;
}

// File processing worker
fileProcessingQueue.process(async (job) => {
  console.log(`Processing file processing job: ${job.id}`);

  try {
    const { jobId, assessmentId, fileContent, fileName, assessmentType, numberOfQuestions, extractMode, questionTypes } = job.data;

    // Update job status
    await JobModel.updateJobStatus(jobId, 'processing');

    let generatedQuestions;

    if (extractMode) {
      // Extract existing questions from the document
      console.log(`Extracting questions from document: ${fileName}`);
      generatedQuestions = extractQuestionsFromText(fileContent);

      if (generatedQuestions.length === 0) {
        throw new Error('No questions found in the document. Make sure your questions are numbered (1., 2., etc.) and answers are marked with "Answer:"');
      }

      console.log(`Extracted ${generatedQuestions.length} questions from ${fileName}`);
    } else {
      // Generate questions from file content using AI
      generatedQuestions = await generateQuestionsFromContent(
        fileContent,
        assessmentType,
        numberOfQuestions,
        questionTypes
      );
    }

    // Add questions to database
    const questionsToCreate = generatedQuestions.map((q, index) => ({
      assessment_id: assessmentId,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points || 0,
      order_index: index,
      is_required: true,
    }));

    const createdQuestions = await QuestionModel.createQuestions(questionsToCreate);

    // Update job with result
    await JobModel.updateJobStatus(jobId, 'completed', {
      questions: createdQuestions,
      count: createdQuestions.length,
      fileName,
    });

    console.log(`File processing job ${job.id} completed successfully`);
  } catch (error: any) {
    console.error(`File processing job ${job.id} failed:`, error);

    // Update job with error
    await JobModel.updateJobStatus(
      job.data.jobId,
      'failed',
      undefined,
      error.message
    );

    throw error;
  }
});

// URL fetch worker
urlFetchQueue.process(async (job) => {
  console.log(`Processing URL fetch job: ${job.id}`);

  try {
    const { jobId, assessmentId, url, assessmentType, numberOfQuestions, questionTypes } = job.data;

    // Update job status
    await JobModel.updateJobStatus(jobId, 'processing');

    // Fetch content from URL
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AtlasBot/1.0)',
      },
    });

    let content = '';

    if (typeof response.data === 'string') {
      content = response.data;
    } else {
      content = JSON.stringify(response.data);
    }

    // Generate questions from fetched content
    const generatedQuestions = await generateQuestionsFromContent(
      content,
      assessmentType,
      numberOfQuestions,
      questionTypes
    );

    // Add questions to database
    const questionsToCreate = generatedQuestions.map((q, index) => ({
      assessment_id: assessmentId,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points || 0,
      order_index: index,
      is_required: true,
    }));

    const createdQuestions = await QuestionModel.createQuestions(questionsToCreate);

    // Update job with result
    await JobModel.updateJobStatus(jobId, 'completed', {
      questions: createdQuestions,
      count: createdQuestions.length,
      url,
    });

    console.log(`URL fetch job ${job.id} completed successfully`);
  } catch (error: any) {
    console.error(`URL fetch job ${job.id} failed:`, error);

    // Update job with error
    await JobModel.updateJobStatus(
      job.data.jobId,
      'failed',
      undefined,
      error.message
    );

    throw error;
  }
});

console.log('Worker processes started successfully');
console.log('Listening for jobs...');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers...');
  await questionGenerationQueue.close();
  await fileProcessingQueue.close();
  await urlFetchQueue.close();
  process.exit(0);
});
