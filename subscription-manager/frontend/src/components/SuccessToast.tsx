'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: ToastProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay to trigger animation
      setTimeout(() => setIsShowing(true), 10);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 200); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsShowing(false);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 200); // Wait for exit animation
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div
        className={`
          bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm w-full
          transform transition-all duration-200 ease-out pointer-events-auto
          ${isShowing 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
          }
        `}
        style={{ transformOrigin: 'top right' }}
      >
        <div className="flex items-start">
          {/* Success Icon */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          
          {/* Message */}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Success!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {message}
            </p>
          </div>
          
          {/* Close Button */}
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 bg-gray-200 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all ease-linear"
            style={{
              width: isShowing ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false
  });

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const ToastComponent = () => (
    <SuccessToast
      message={toast.message}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent
  };
}