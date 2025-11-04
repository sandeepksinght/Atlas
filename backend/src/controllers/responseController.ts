import { Request, Response } from 'express';
import * as ShareLinkModel from '../models/ShareLink';
import * as AssessmentModel from '../models/Assessment';
import * as QuestionModel from '../models/Question';
import * as ResponseModel from '../models/Response';

export const getAssessmentByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const shareLink = await ShareLinkModel.findShareLinkByToken(token);

    if (!shareLink) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }

    const assessment = await AssessmentModel.findAssessmentById(shareLink.assessment_id);

    if (!assessment || !assessment.is_published) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const questions = await QuestionModel.findQuestionsByAssessmentId(assessment.id);

    // Remove correct answers from questions for security
    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options,
      points: q.points,
      order_index: q.order_index,
      is_required: q.is_required,
    }));

    res.json({
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      settings: assessment.settings,
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    console.error('Get assessment by token error:', error);
    res.status(500).json({ error: 'Failed to get assessment' });
  }
};

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { respondent_name, respondent_email, answers } = req.body;

    const shareLink = await ShareLinkModel.findShareLinkByToken(token);

    if (!shareLink) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }

    const assessment = await AssessmentModel.findAssessmentById(shareLink.assessment_id);

    if (!assessment || !assessment.is_published) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const questions = await QuestionModel.findQuestionsByAssessmentId(assessment.id);

    // Calculate score for quizzes
    let score: number | null = null;
    let maxScore: number | null = null;

    if (assessment.type === 'quiz') {
      score = 0;
      maxScore = 0;

      for (const question of questions) {
        maxScore += question.points;

        const userAnswer = answers[question.id];
        const correctAnswer = question.correct_answer;

        if (correctAnswer) {
          // Handle different question types
          if (question.question_type === 'multiple_choice') {
            // For multiple choice, compare arrays
            const correct = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
            const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

            const isCorrect =
              correct.length === user.length &&
              correct.every((a: string) => user.includes(a));

            if (isCorrect) {
              score += question.points;
            }
          } else {
            // For single choice and other types
            if (userAnswer === correctAnswer) {
              score += question.points;
            }
          }
        }
      }
    }

    const response = await ResponseModel.createResponse(
      assessment.id,
      respondent_name,
      respondent_email,
      answers,
      score,
      maxScore
    );

    res.status(201).json({
      message: 'Response submitted successfully',
      id: response.id,
      score,
      maxScore,
    });
  } catch (error: any) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};
