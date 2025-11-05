import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import * as api from '../../services/api';
import { toast } from 'react-toastify';

export const JoinGame: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'pin' | 'nickname'>('pin');
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameTitle, setGameTitle] = useState('');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      toast.error('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/game/join/${pin}`);
      setGameTitle(response.data.title);
      setStep('nickname');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Game not found');
    } finally {
      setLoading(false);
    }
  };

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error('Please enter a nickname');
      return;
    }

    // Navigate to game lobby with PIN and nickname
    navigate(`/game/play?pin=${pin}&nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4">
            <span className="text-4xl">🎮</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
            dStudio LIVE
          </h1>
          <p className="text-white/90 text-lg font-medium">Join the game!</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {step === 'pin' ? (
            <form onSubmit={handlePinSubmit}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Game PIN</h2>
                <p className="text-gray-600">Ask your host for the 6-digit code</p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-5xl font-black tracking-widest py-6 px-4 bg-gray-100 border-4 border-gray-200 rounded-2xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:bg-white transition-all"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={pin.length !== 6 || loading}
                loading={loading}
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleNicknameSubmit}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-purple-900 font-semibold">PIN: {pin}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{gameTitle}</h2>
                <p className="text-gray-600">Enter your nickname</p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                  className="w-full text-center text-3xl font-bold py-6 px-4 bg-gray-100 border-4 border-gray-200 rounded-2xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:bg-white transition-all"
                  placeholder="Your Name"
                  maxLength={20}
                  autoFocus
                />
                <p className="text-sm text-gray-500 text-center mt-2">
                  {nickname.length}/20 characters
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!nickname.trim()}
                >
                  Join Game
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full py-3 rounded-2xl"
                  onClick={() => setStep('pin')}
                >
                  Change PIN
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            Powered by <span className="font-semibold">dStudio by CognoStack</span>
          </p>
        </div>
      </div>
    </div>
  );
};
