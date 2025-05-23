'use client';

import { useState } from 'react';
import { MessageSquare, Bug, Sparkles } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
  userEmail?: string;
}

export default function FeedbackButton({ userEmail }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <div 
        className="fixed bottom-6 right-6 z-40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expanded Options (shown on hover) */}
        <div className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-2 space-y-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 rounded-md transition-colors duration-200"
            >
              <Bug className="h-4 w-4" />
              <span>Report a bug</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 rounded-md transition-colors duration-200"
            >
              <Sparkles className="h-4 w-4" />
              <span>Request feature</span>
            </button>
          </div>
        </div>

        {/* Main Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          aria-label="Send feedback"
        >
          <MessageSquare className="h-6 w-6" />
          
          {/* Tooltip */}
          <span className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-secondary-900 text-white text-sm px-3 py-1.5 rounded-md whitespace-nowrap transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            Send Feedback
          </span>

          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20"></span>
        </button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}