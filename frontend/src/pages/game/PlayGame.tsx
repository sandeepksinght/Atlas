import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGameSocket, QuestionData, LeaderboardEntry } from '../../hooks/useGameSocket';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';

type GameStatus = 'joining' | 'lobby' | 'question' | 'answered' | 'leaderboard' | 'finished';

export const PlayGame: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pin = searchParams.get('pin');
  const nickname = searchParams.get('nickname');

  const socket = useGameSocket();
  const [status, setStatus] = useState<GameStatus>('joining');
  const [participantId, setParticipantId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; points: number } | null>(null);

  useEffect(() => {
    if (!pin || !nickname) {
      navigate('/game/join');
      return;
    }

    // Join the game
    socket.joinGame(pin, nickname)
      .then((response) => {
        setParticipantId(response.participantId);
        setSessionId(response.sessionId);
        setStatus('lobby');
        toast.success('Joined game!');
      })
      .catch((error) => {
        toast.error(error.message);
        navigate('/game/join');
      });
  }, [pin, nickname]);

  useEffect(() => {
    const cleanup: (() => void)[] = [];

    cleanup.push(socket.onGameStarted(() => {
      setStatus('lobby');
      toast.info('Game is starting...');
    }));

    cleanup.push(socket.onQuestionShow((question) => {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setLastResult(null);
      setTimeLeft(question.timeLimit);
      setStatus('question');
    }));

    cleanup.push(socket.onLeaderboardShow((data) => {
      setLeaderboard(data.leaderboard);
      setStatus('leaderboard');

      // Update my score
      const me = data.leaderboard.find(p => p.id === participantId);
      if (me) setMyScore(me.score);
    }));

    cleanup.push(socket.onGameEnded((data) => {
      setLeaderboard(data.finalLeaderboard);
      setStatus('finished');
    }));

    cleanup.push(socket.onHostDisconnected(() => {
      toast.error('Host disconnected');
      navigate('/game/join');
    }));

    return () => cleanup.forEach(fn => fn());
  }, [socket, participantId]);

  // Timer countdown
  useEffect(() => {
    if (status === 'question' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeLeft]);

  const handleAnswerSelect = async (answer: string) => {
    if (!currentQuestion || status !== 'question') return;

    setSelectedAnswer(answer);
    setStatus('answered');

    try {
      const result = await socket.submitAnswer({
        sessionId,
        participantId,
        questionId: currentQuestion.id,
        questionIndex: currentQuestion.questionIndex,
        answer,
      });

      setLastResult(result);
      setMyScore(prev => prev + result.points);
    } catch (error: any) {
      toast.error('Failed to submit answer');
    }
  };

  if (status === 'joining') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-white mb-4"></div>
          <p className="text-2xl font-bold">Joining game...</p>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="text-8xl mb-6 animate-bounce">⏳</div>
          <h1 className="text-5xl font-black mb-4">You're In!</h1>
          <p className="text-2xl font-bold mb-2">{nickname}</p>
          <p className="text-xl opacity-90">Waiting for host to start the game...</p>
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'question' && currentQuestion) {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
    const shapes = ['triangle', 'diamond', 'circle', 'square'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col">
        {/* Timer */}
        <div className="p-4 bg-black/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-white font-bold text-2xl">{nickname}</div>
              <div className="flex items-center space-x-4">
                <div className="text-white font-bold text-xl">Score: {myScore}</div>
                <div className={`text-4xl font-black ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>
            <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-4xl w-full mb-8">
            <h2 className="text-white text-3xl md:text-5xl font-black text-center leading-tight drop-shadow-lg">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={timeLeft === 0}
                className={`${colors[index]} hover:scale-105 active:scale-95 transition-transform p-8 rounded-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-black">{['▲', '♦', '●', '■'][index]}</span>
                  </div>
                  <span className="text-white text-2xl md:text-3xl font-bold text-left flex-1">
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'answered' && lastResult) {
    return (
      <div className={`min-h-screen ${lastResult.isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'} flex items-center justify-center p-4`}>
        <div className="text-center text-white">
          <div className="text-9xl mb-6 animate-bounce">
            {lastResult.isCorrect ? '✓' : '✗'}
          </div>
          <h1 className="text-6xl font-black mb-4">
            {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
          </h1>
          {lastResult.isCorrect && (
            <p className="text-3xl font-bold mb-2">+{lastResult.points} points</p>
          )}
          <p className="text-2xl opacity-90">Waiting for other players...</p>
        </div>
      </div>
    );
  }

  if (status === 'leaderboard') {
    const myRank = leaderboard.findIndex(p => p.id === participantId) + 1;
    const top5 = leaderboard.slice(0, 5);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-5xl font-black text-white text-center mb-8">Leaderboard</h1>

          {/* My Position */}
          {myRank > 5 && (
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 border-4 border-yellow-400">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-900">#{myRank}</span>
                  </div>
                  <div>
                    <p className="font-bold text-xl">You</p>
                    <p className="text-sm opacity-90">{nickname}</p>
                  </div>
                </div>
                <div className="text-3xl font-black">{myScore}</div>
              </div>
            </div>
          )}

          {/* Top 5 */}
          <div className="space-y-3">
            {top5.map((player, index) => {
              const isMe = player.id === participantId;
              const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
              const bgColors = [
                'bg-gradient-to-r from-yellow-400 to-yellow-500',
                'bg-gradient-to-r from-gray-300 to-gray-400',
                'bg-gradient-to-r from-orange-400 to-orange-500',
                'bg-white/20',
                'bg-white/20',
              ];

              return (
                <div
                  key={player.id}
                  className={`${bgColors[index]} ${isMe ? 'ring-4 ring-white' : ''} backdrop-blur rounded-2xl p-4 shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{medal}</div>
                      <div className={index < 3 ? 'text-gray-900' : 'text-white'}>
                        <p className={`font-bold text-xl ${isMe ? 'text-yellow-300' : ''}`}>
                          {player.nickname} {isMe && '(You)'}
                        </p>
                        <p className="text-sm opacity-75">
                          {player.correct_answers}/{player.total_answers} correct
                        </p>
                      </div>
                    </div>
                    <div className={`text-4xl font-black ${index < 3 ? 'text-gray-900' : 'text-white'}`}>
                      {player.score}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-white text-center mt-8 text-xl opacity-90">
            Get ready for the next question...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const myRank = leaderboard.findIndex(p => p.id === participantId) + 1;
    const myData = leaderboard.find(p => p.id === participantId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-6xl font-black text-white mb-4">Game Over!</h1>

          {/* Your Result */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
            <div className="text-6xl mb-4">
              {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎯'}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              {myRank === 1 ? 'Winner!' : `${myRank}${myRank === 1 ? 'st' : myRank === 2 ? 'nd' : myRank === 3 ? 'rd' : 'th'} Place`}
            </h2>
            <p className="text-2xl font-bold text-gray-700 mb-1">{nickname}</p>
            <p className="text-5xl font-black text-purple-600 mb-4">{myData?.score || 0} points</p>
            <p className="text-gray-600">
              {myData?.correct_answers}/{myData?.total_answers} correct answers
            </p>
          </div>

          {/* Final Leaderboard */}
          <div className="bg-white/10 backdrop-blur rounded-3xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Final Standings</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === participantId ? 'bg-yellow-400 text-gray-900' : 'bg-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold w-8">#{index + 1}</span>
                    <span className="font-medium">{player.nickname}</span>
                  </div>
                  <span className="font-black text-xl">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => navigate('/game/join')}
            className="mt-8 py-4 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
