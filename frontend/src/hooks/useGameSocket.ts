import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface GameParticipant {
  id: string;
  nickname: string;
  score: number;
}

export interface QuestionData {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  questionIndex: number;
  timeLimit: number;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  correct_answers: number;
  total_answers: number;
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const createSession = (sessionId: string): Promise<{ pin: string }> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('host:create-session', { sessionId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const joinGame = (pin: string, nickname: string): Promise<{ participantId: string; sessionId: string }> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('participant:join', { pin, nickname }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const startGame = (sessionId: string, questions: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('host:start-game', { sessionId, questions }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  const showQuestion = (sessionId: string, question: any, questionIndex: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('host:show-question', { sessionId, question, questionIndex }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  const submitAnswer = (data: {
    sessionId: string;
    participantId: string;
    questionId: string;
    questionIndex: number;
    answer: string;
  }): Promise<{ isCorrect: boolean; points: number }> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('participant:answer', data, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const showLeaderboard = (sessionId: string, questionIndex: number): Promise<{ leaderboard: LeaderboardEntry[] }> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('host:show-leaderboard', { sessionId, questionIndex }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const endGame = (sessionId: string): Promise<{ finalLeaderboard: LeaderboardEntry[] }> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('host:end-game', { sessionId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const onParticipantJoined = (callback: (data: { id: string; nickname: string; count: number }) => void) => {
    socketRef.current?.on('participant:joined', callback);
    return () => {
      socketRef.current?.off('participant:joined', callback);
    };
  };

  const onParticipantLeft = (callback: (data: { nickname: string; count: number }) => void) => {
    socketRef.current?.on('participant:left', callback);
    return () => {
      socketRef.current?.off('participant:left', callback);
    };
  };

  const onGameStarted = (callback: (data: { totalQuestions: number }) => void) => {
    socketRef.current?.on('game:started', callback);
    return () => {
      socketRef.current?.off('game:started', callback);
    };
  };

  const onQuestionShow = (callback: (question: QuestionData) => void) => {
    socketRef.current?.on('question:show', callback);
    return () => {
      socketRef.current?.off('question:show', callback);
    };
  };

  const onParticipantAnswered = (callback: (data: { participantId: string; nickname: string; isCorrect: boolean; timeTaken: number }) => void) => {
    socketRef.current?.on('participant:answered', callback);
    return () => {
      socketRef.current?.off('participant:answered', callback);
    };
  };

  const onLeaderboardShow = (callback: (data: { leaderboard: LeaderboardEntry[] }) => void) => {
    socketRef.current?.on('leaderboard:show', callback);
    return () => {
      socketRef.current?.off('leaderboard:show', callback);
    };
  };

  const onGameEnded = (callback: (data: { finalLeaderboard: LeaderboardEntry[] }) => void) => {
    socketRef.current?.on('game:ended', callback);
    return () => {
      socketRef.current?.off('game:ended', callback);
    };
  };

  const onHostDisconnected = (callback: () => void) => {
    socketRef.current?.on('host:disconnected', callback);
    return () => {
      socketRef.current?.off('host:disconnected', callback);
    };
  };

  return {
    connected,
    participants,
    createSession,
    joinGame,
    startGame,
    showQuestion,
    submitAnswer,
    showLeaderboard,
    endGame,
    onParticipantJoined,
    onParticipantLeft,
    onGameStarted,
    onQuestionShow,
    onParticipantAnswered,
    onLeaderboardShow,
    onGameEnded,
    onHostDisconnected,
  };
}
