import React, { useState } from 'react';
import * as api from '../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  assessmentTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, assessmentId, assessmentTitle }) => {
  const [shareLink, setShareLink] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      generateLink();
    } else {
      // Reset state when modal closes
      setShareLink('');
      setError('');
      setCopied(false);
    }
  }, [isOpen, assessmentId]);

  const generateLink = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.generateShareLink(assessmentId);
      const token = response.data.token;
      const link = `${window.location.origin}/take/${token}`;
      setShareLink(link);
    } catch (err: any) {
      console.error('Error generating share link:', err);
      setError(err.response?.data?.error || 'Failed to generate share link. Make sure the assessment is published.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Share Assessment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4">Share "{assessmentTitle}" with others</p>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Generating share link...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {shareLink && !loading && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can take the assessment
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
