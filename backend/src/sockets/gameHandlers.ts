import { Server, Socket } from 'socket.io';
import { GameSessionModel } from '../models/GameSession';

interface GameRoom {
  sessionId: string;
  hostSocket: string;
  participants: Map<string, { socketId: string; participantId: string; nickname: string }>;
  currentQuestion: any;
  questionStartTime: number;
}

const gameRooms = new Map<string, GameRoom>();

export function setupGameSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // HOST: Create a game session
    socket.on('host:create-session', async (data: { sessionId: string }, callback) => {
      try {
        const session = await GameSessionModel.findById(data.sessionId);
        if (!session) {
          callback({ error: 'Session not found' });
          return;
        }

        const roomId = session.pin;
        socket.join(roomId);

        gameRooms.set(roomId, {
          sessionId: data.sessionId,
          hostSocket: socket.id,
          participants: new Map(),
          currentQuestion: null,
          questionStartTime: 0,
        });

        callback({ success: true, pin: session.pin });
        console.log(`Host created session with PIN: ${session.pin}`);
      } catch (error) {
        console.error('Error creating session:', error);
        callback({ error: 'Failed to create session' });
      }
    });

    // PARTICIPANT: Join game
    socket.on('participant:join', async (data: { pin: string; nickname: string }, callback) => {
      try {
        const session = await GameSessionModel.findByPin(data.pin);
        if (!session) {
          callback({ error: 'Game not found' });
          return;
        }

        if (session.status !== 'lobby') {
          callback({ error: 'Game already started' });
          return;
        }

        // Add participant to database
        const participant = await GameSessionModel.addParticipant(session.id, data.nickname);

        const roomId = data.pin;
        socket.join(roomId);

        const room = gameRooms.get(roomId);
        if (room) {
          room.participants.set(socket.id, {
            socketId: socket.id,
            participantId: participant.id,
            nickname: data.nickname,
          });
        }

        // Notify host of new participant
        io.to(roomId).emit('participant:joined', {
          id: participant.id,
          nickname: data.nickname,
          count: room?.participants.size || 0,
        });

        callback({ success: true, participantId: participant.id, sessionId: session.id });
        console.log(`${data.nickname} joined game ${data.pin}`);
      } catch (error) {
        console.error('Error joining game:', error);
        callback({ error: 'Failed to join game' });
      }
    });

    // HOST: Start game
    socket.on('host:start-game', async (data: { sessionId: string, questions: any[] }, callback) => {
      try {
        const session = await GameSessionModel.findById(data.sessionId);
        if (!session) {
          callback({ error: 'Session not found' });
          return;
        }

        await GameSessionModel.updateStatus(session.id, 'playing');

        const roomId = session.pin;
        const room = gameRooms.get(roomId);
        if (room) {
          room.currentQuestion = data.questions[0];
          room.questionStartTime = Date.now();
        }

        // Notify all participants
        io.to(roomId).emit('game:started', {
          totalQuestions: data.questions.length,
        });

        callback({ success: true });
        console.log(`Game ${session.pin} started`);
      } catch (error) {
        console.error('Error starting game:', error);
        callback({ error: 'Failed to start game' });
      }
    });

    // HOST: Show question
    socket.on('host:show-question', async (data: { sessionId: string; question: any; questionIndex: number }, callback) => {
      try {
        const session = await GameSessionModel.findById(data.sessionId);
        if (!session) {
          callback({ error: 'Session not found' });
          return;
        }

        await GameSessionModel.updateStatus(session.id, 'question', {
          current_question_index: data.questionIndex,
        });

        const roomId = session.pin;
        const room = gameRooms.get(roomId);
        if (room) {
          room.currentQuestion = data.question;
          room.questionStartTime = Date.now();
        }

        // Send question to all participants (without correct answer)
        const questionForParticipants = {
          id: data.question.id,
          question_text: data.question.question_text,
          question_type: data.question.question_type,
          options: data.question.options,
          questionIndex: data.questionIndex,
          timeLimit: session.settings.question_time_limit || 20,
        };

        io.to(roomId).emit('question:show', questionForParticipants);

        callback({ success: true });
        console.log(`Question ${data.questionIndex} shown in game ${session.pin}`);
      } catch (error) {
        console.error('Error showing question:', error);
        callback({ error: 'Failed to show question' });
      }
    });

    // PARTICIPANT: Submit answer
    socket.on('participant:answer', async (data: {
      sessionId: string;
      participantId: string;
      questionId: string;
      questionIndex: number;
      answer: string;
    }, callback) => {
      try {
        const session = await GameSessionModel.findById(data.sessionId);
        if (!session) {
          callback({ error: 'Session not found' });
          return;
        }

        const room = gameRooms.get(session.pin);
        if (!room || !room.currentQuestion) {
          callback({ error: 'No active question' });
          return;
        }

        // Calculate time taken and points
        const timeTaken = Math.floor((Date.now() - room.questionStartTime) / 1000);
        const timeLimit = session.settings.question_time_limit || 20;
        const isCorrect = data.answer === room.currentQuestion.correct_answer;

        // Points: 1000 base points if correct, with time bonus
        let points = 0;
        if (isCorrect) {
          const timeBonus = Math.floor(((timeLimit - timeTaken) / timeLimit) * 500);
          points = 500 + Math.max(0, timeBonus);
        }

        // Record answer in database
        await GameSessionModel.recordAnswer({
          game_session_id: data.sessionId,
          participant_id: data.participantId,
          question_id: data.questionId,
          question_index: data.questionIndex,
          answer: data.answer,
          is_correct: isCorrect,
          points_awarded: points,
          time_taken: timeTaken,
        });

        // Notify host that participant answered
        const participant = room.participants.get(socket.id);
        if (participant) {
          io.to(room.hostSocket).emit('participant:answered', {
            participantId: data.participantId,
            nickname: participant.nickname,
            isCorrect,
            timeTaken,
          });
        }

        callback({ success: true, isCorrect, points });
      } catch (error) {
        console.error('Error submitting answer:', error);
        callback({ error: 'Failed to submit answer' });
      }
    });

    // HOST: Show results/leaderboard
    socket.on('host:show-leaderboard', async (data: { sessionId: string; questionIndex: number }, callback) => {
      try {
        const session = await GameSessionModel.findById(data.sessionId);
        if (!session) {
          callback({ error: 'Session not found' });
          return;
        }

        await GameSessionModel.updateStatus(session.id, 'leaderboard');

        // Get question results and overall leaderboard
        const questionResults = await GameSessionModel.getQuestionResults(session.id, data.questionIndex);
        const leaderboard = await GameSessionModel.getLeaderboard(session.id);

        const roomId = session.pin;
        io.to(roomId).emit('leaderboard:show', {
          questionResults,
          leaderboard: leaderboard.slice(0, 10), // Top 10
        });

        callback({ success: true, leaderboard });
        console.log(`Leaderboard shown for game ${session.pin}`);
      } catch (error) {
        console.error('Error showing leaderboard:', error);
        callback({ error: 'Failed to show leaderboard' });
      }
    });

    // HOST: End game
    socket.on('host:end-game', async (data: { sessionId: string }, callback) => {
      try {
        const session = await GameSessionModel.findById(data.sessionId);
        if (!session) {
          callback({ error: 'Session not found' });
          return;
        }

        await GameSessionModel.endSession(session.id);

        const finalLeaderboard = await GameSessionModel.getLeaderboard(session.id);

        const roomId = session.pin;
        io.to(roomId).emit('game:ended', {
          finalLeaderboard,
        });

        // Clean up room
        gameRooms.delete(roomId);

        callback({ success: true, finalLeaderboard });
        console.log(`Game ${session.pin} ended`);
      } catch (error) {
        console.error('Error ending game:', error);
        callback({ error: 'Failed to end game' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Remove from any game rooms
      for (const [pin, room] of gameRooms.entries()) {
        if (room.hostSocket === socket.id) {
          // Host disconnected - notify participants
          io.to(pin).emit('host:disconnected');
          gameRooms.delete(pin);
        } else if (room.participants.has(socket.id)) {
          // Participant disconnected
          const participant = room.participants.get(socket.id);
          room.participants.delete(socket.id);
          io.to(pin).emit('participant:left', {
            nickname: participant?.nickname,
            count: room.participants.size,
          });
        }
      }
    });
  });
}
