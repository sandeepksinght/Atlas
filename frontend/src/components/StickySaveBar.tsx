import React from 'react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export interface StickySaveBarProps {
  onSave: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
  isPublished?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
}

export const StickySaveBar: React.FC<StickySaveBarProps> = ({
  onSave,
  onPreview,
  onPublish,
  onDiscard,
  isSaving = false,
  isPublished = false,
  hasUnsavedChanges = false,
  lastSaved = null,
}) => {
  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just saved';
    if (diffMins === 1) return 'Saved 1 minute ago';
    if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
    return 'Saved over an hour ago';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Save status */}
          <div className="flex items-center space-x-3">
            {isSaving && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </div>
            )}

            {!isSaving && lastSaved && (
              <div className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-600">{getLastSavedText()}</span>
              </div>
            )}

            {hasUnsavedChanges && !isSaving && (
              <div className="flex items-center text-sm">
                <span className="h-2 w-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-gray-600">Unsaved changes</span>
              </div>
            )}

            {/* Keyboard shortcut hint */}
            <div className="hidden md:flex items-center text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
              </kbd>
              <span className="mx-1">+</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600">
                S
              </kbd>
              <span className="ml-2">to save</span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {onDiscard && (
              <Button
                variant="ghost"
                size="md"
                onClick={onDiscard}
                disabled={!hasUnsavedChanges}
              >
                Discard
              </Button>
            )}

            {onPreview && (
              <Button variant="secondary" size="md" onClick={onPreview}>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={onSave}
              loading={isSaving}
              icon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              }
            >
              Save
            </Button>

            {onPublish && !isPublished && (
              <Button variant="primary" size="md" onClick={onPublish}>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
