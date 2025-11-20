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
    const { jobId, assessmentId, content, assessmentType, numberOfQuestions } = job.data;

    // Update job status
    await JobModel.updateJobStatus(jobId, 'processing');

    // Generate questions using OpenAI
    const generatedQuestions = await generateQuestionsFromContent(
      content,
      assessmentType,
      numberOfQuestions
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

// File processing worker
fileProcessingQueue.process(async (job) => {
  console.log(`Processing file processing job: ${job.id}`);

  try {
    const { jobId, assessmentId, fileContent, fileName, assessmentType, numberOfQuestions } = job.data;

    // Update job status
    await JobModel.updateJobStatus(jobId, 'processing');

    // Generate questions from file content
    const generatedQuestions = await generateQuestionsFromContent(
      fileContent,
      assessmentType,
      numberOfQuestions
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
    const { jobId, assessmentId, url, assessmentType, numberOfQuestions } = job.data;

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
      numberOfQuestions
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
