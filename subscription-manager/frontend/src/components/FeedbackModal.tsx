'use client';

import { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function FeedbackModal({ isOpen, onClose, userEmail }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const feedbackTypes = [
    { value: 'bug', label: '🐛 Bug Report', description: 'Something isn\'t working' },
    { value: 'feature', label: '✨ Feature Request', description: 'Suggest an improvement' },
    { value: 'general', label: '💬 General Feedback', description: 'Share your thoughts' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter your feedback');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send feedback to backend using centralized API
      const data = await apiRequest<{ 
        message: string; 
        feedback: { 
          id: string; 
          type: string; 
          createdAt: string; 
        } 
      }>(
        '/feedback',
        {
          method: 'POST',
          body: JSON.stringify({
            type: feedbackType,
            email,
            message
          })
        },
        false // Don't require authentication
      );

      console.log('Feedback submitted:', data);
      setSubmitStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setMessage('');
        setSubmitStatus('idle');
        onClose();
      }, 2000);
      
    } catch {
      setSubmitStatus('error');
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      setError('');
      setSubmitStatus('idle');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-secondary-900">
                Send Feedback
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-secondary-400 hover:text-secondary-600 transition-colors duration-200 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Success State */}
          {submitStatus === 'success' ? (
            <div className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Thank you for your feedback!
              </h3>
              <p className="text-secondary-600">
                We appreciate you taking the time to help us improve.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  What type of feedback?
                </label>
                <div className="space-y-2">
                  {feedbackTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                        feedbackType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedbackType"
                        value={type.value}
                        checked={feedbackType === type.value}
                        onChange={(e) => setFeedbackType(e.target.value as typeof feedbackType)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-secondary-900">
                          {type.label}
                        </div>
                        <div className="text-sm text-secondary-600">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="feedback-email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="feedback-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="your@email.com"
                  disabled={isSubmitting || !!userEmail}
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium text-secondary-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                  placeholder={
                    feedbackType === 'bug' 
                      ? "Please describe the issue you're experiencing..."
                      : feedbackType === 'feature'
                      ? "What feature would you like to see?"
                      : "Share your thoughts with us..."
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-secondary-500 mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-danger-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || message.length > 500}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}