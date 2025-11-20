import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { GameSessionModel } from '../models/GameSession';
import { findQuestionsByAssessmentId } from '../models/Question';
import { Response } from 'express';

const router = express.Router();

// Create a new game session
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { assessment_id, title, settings } = req.body;

    const session = await GameSessionModel.create({
      host_id: userId,
      assessment_id,
      title: title || 'Live Game',
      settings: settings || {
        question_time_limit: 20,
        show_leaderboard_after_question: true,
        randomize_questions: false,
        randomize_answers: true,
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ error: 'Failed to create game session' });
  }
});

// Get session by PIN (for participants)
router.get('/join/:pin', async (req, res) => {
  try {
    const { pin } = req.params;
    const session = await GameSessionModel.findByPin(pin);

    if (!session) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      id: session.id,
      title: session.title,
      status: session.status,
      pin: session.pin,
    });
  } catch (error) {
    console.error('Error finding game:', error);
    res.status(500).json({ error: 'Failed to find game' });
  }
});

// Get session details (for host)
router.get('/session/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const session = await GameSessionModel.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify host
    if (session.host_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get participants
    const participants = await GameSessionModel.getParticipants(id);

    // Get questions if assessment_id exists
    let questions: any[] = [];
    if (session.assessment_id) {
      questions = await findQuestionsByAssessmentId(session.assessment_id);
    }

    res.json({
      ...session,
      participants,
      questions,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Get participants in a session
router.get('/session/:id/participants', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const participants = await GameSessionModel.getParticipants(id);
    res.json(participants);
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

// Get leaderboard
router.get('/session/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;
    const leaderboard = await GameSessionModel.getLeaderboard(id);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

export default router;
