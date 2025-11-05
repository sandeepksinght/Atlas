import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSocket, LeaderboardEntry } from '../../hooks/useGameSocket';
import { Button } from '../../components/ui/Button';
import * as api from '../../services/api';
import { toast } from 'react-toastify';

type GameStatus = 'loading' | 'lobby' | 'playing' | 'question' | 'leaderboard' | 'finished';

interface Participant {
  id: string;
  nickname: string;
  score: number;
  answered?: boolean;
}

export const HostGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const socket = useGameSocket();

  const [status, setStatus] = useState<GameStatus>('loading');
  const [pin, setPin] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    loadGameSession();
  }, [sessionId]);

  const loadGameSession = async () => {
    try {
      const response = await api.get(`/game/session/${sessionId}`);
      const session = response.data;

      setGameTitle(session.title);
      setQuestions(session.questions || []);
      setParticipants(session.participants || []);

      // Create WebSocket session
      const { pin: gamePin } = await socket.createSession(sessionId);
      setPin(gamePin);
      setStatus('lobby');
    } catch (error) {
      toast.error('Failed to load game session');
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const cleanup: (() => void)[] = [];

    cleanup.push(socket.onParticipantJoined((data) => {
      setParticipants(prev => [
        ...prev,
        { id: data.id, nickname: data.nickname, score: 0, answered: false },
      ]);
      toast.success(`${data.nickname} joined!`);
    }));

    cleanup.push(socket.onParticipantLeft((data) => {
      setParticipants(prev => prev.filter(p => p.nickname !== data.nickname));
      toast.info(`${data.nickname} left`);
    }));

    cleanup.push(socket.onParticipantAnswered((data) => {
      setAnsweredCount(prev => prev + 1);
      setParticipants(prev =>
        prev.map(p =>
          p.id === data.participantId ? { ...p, answered: true } : p
        )
      );
    }));

    return () => cleanup.forEach(fn => fn());
  }, [socket]);

  // Timer for question
  useEffect(() => {
    if (status === 'question' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            // Time's up - show leaderboard
            handleShowLeaderboard();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeLeft]);

  const handleStartGame = async () => {
    if (participants.length === 0) {
      toast.error('Need at least 1 participant');
      return;
    }

    try {
      await socket.startGame(sessionId!, questions);
      setStatus('playing');
      toast.success('Game started!');

      // Show first question after a brief delay
      setTimeout(() => {
        handleShowQuestion(0);
      }, 2000);
    } catch (error) {
      toast.error('Failed to start game');
    }
  };

  const handleShowQuestion = async (index: number) => {
    const question = questions[index];
    setCurrentQuestionIndex(index);
    setAnsweredCount(0);
    setParticipants(prev => prev.map(p => ({ ...p, answered: false })));

    const timeLimit = 20; // Can be configured
    setTimeLeft(timeLimit);

    try {
      await socket.showQuestion(sessionId!, question, index);
      setStatus('question');
    } catch (error) {
      toast.error('Failed to show question');
    }
  };

  const handleShowLeaderboard = async () => {
    try {
      const { leaderboard: lb } = await socket.showLeaderboard(sessionId!, currentQuestionIndex);
      setLeaderboard(lb);
      setParticipants(lb.map(p => ({ id: p.id, nickname: p.nickname, score: p.score })));
      setStatus('leaderboard');
    } catch (error) {
      toast.error('Failed to show leaderboard');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleShowQuestion(currentQuestionIndex + 1);
    } else {
      handleEndGame();
    }
  };

  const handleEndGame = async () => {
    try {
      const { finalLeaderboard } = await socket.endGame(sessionId!);
      setLeaderboard(finalLeaderboard);
      setStatus('finished');
      toast.success('Game ended!');
    } catch (error) {
      toast.error('Failed to end game');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
          <p className="text-xl font-bold text-gray-700">Loading game...</p>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="text-center">
              <h1 className="text-4xl font-black text-gray-900 mb-2">{gameTitle}</h1>
              <p className="text-gray-600 mb-6">Waiting for players to join...</p>

              {/* PIN Display */}
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 shadow-xl">
                <p className="text-white text-sm font-semibold mb-2 opacity-90">Game PIN</p>
                <p className="text-white text-8xl font-black tracking-wider">{pin}</p>
              </div>

              <div className="mt-6">
                <p className="text-gray-600 mb-2">Join at:</p>
                <p className="text-2xl font-bold text-blue-600">dstudio.cognostack.com/game/join</p>
              </div>
            </div>
          </div>

          {/* Participants Grid */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Players ({participants.length})
              </h2>
              <Button
                onClick={handleStartGame}
                disabled={participants.length === 0}
                className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Start Game
              </Button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-xl">Waiting for players...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 text-center border-2 border-blue-200"
                  >
                    <div className="text-4xl mb-2">👤</div>
                    <p className="font-bold text-gray-900 truncate">{participant.nickname}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 text-white text-center">
            <p className="text-lg">
              <span className="font-bold">{questions.length}</span> questions ready
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'question') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <div className="h-2 w-32 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm opacity-75">Answered</p>
                  <p className="text-2xl font-black">
                    {answeredCount}/{participants.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Time</p>
                  <p className={`text-4xl font-black ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : ''}`}>
                    {timeLeft}s
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-6">
            <h2 className="text-5xl font-black text-gray-900 text-center mb-8">
              {currentQuestion.question_text}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {currentQuestion.options?.map((option: string, index: number) => {
                const colors = [
                  'from-red-500 to-red-600',
                  'from-blue-500 to-blue-600',
                  'from-yellow-500 to-yellow-600',
                  'from-green-500 to-green-600',
                ];
                const symbols = ['▲', '♦', '●', '■'];

                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${colors[index]} rounded-2xl p-6 shadow-lg`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-3xl font-black">{symbols[index]}</span>
                      </div>
                      <span className="text-white text-2xl font-bold flex-1">{option}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleShowLeaderboard}
              className="px-8 py-4 text-lg font-bold bg-white text-purple-700"
            >
              Show Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'leaderboard') {
    const top5 = leaderboard.slice(0, 5);
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-black text-white text-center mb-8">
            {isLastQuestion ? 'Final Results' : 'Leaderboard'}
          </h1>

          <div className="space-y-4 mb-8">
            {top5.map((player, index) => {
              const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
              const bgColors = [
                'bg-gradient-to-r from-yellow-400 to-yellow-500',
                'bg-gradient-to-r from-gray-300 to-gray-400',
                'bg-gradient-to-r from-orange-400 to-orange-500',
                'bg-white/20',
                'bg-white/20',
              ];

              return (
                <div key={player.id} className={`${bgColors[index]} backdrop-blur rounded-2xl p-6 shadow-2xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-6xl">{medal}</div>
                      <div className={index < 3 ? 'text-gray-900' : 'text-white'}>
                        <p className="font-black text-3xl">{player.nickname}</p>
                        <p className="text-lg opacity-75">
                          {player.correct_answers}/{player.total_answers} correct
                        </p>
                      </div>
                    </div>
                    <div className={`text-5xl font-black ${index < 3 ? 'text-gray-900' : 'text-white'}`}>
                      {player.score}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            {!isLastQuestion ? (
              <Button
                onClick={handleNextQuestion}
                className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl"
              >
                Next Question →
              </Button>
            ) : (
              <Button
                onClick={handleEndGame}
                className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl"
              >
                Finish Game
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-9xl mb-6">🏆</div>
          <h1 className="text-7xl font-black text-white mb-4">Game Over!</h1>
          <p className="text-3xl text-white/90 mb-12">Thanks for playing!</p>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Final Standings</h2>
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-black text-gray-600 w-12">#{index + 1}</span>
                    <span className="text-xl font-bold text-gray-900">{player.nickname}</span>
                  </div>
                  <span className="text-2xl font-black text-purple-600">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 text-xl font-bold bg-white text-purple-900 rounded-2xl"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              className="px-8 py-4 text-xl font-bold rounded-2xl"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
