'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error to console for debugging
    console.error('Error boundary caught:', error, errorInfo);
    
    // In production, this would send to an error tracking service
    if (typeof window !== 'undefined') {
      // Log to local storage for debugging
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      try {
        const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        existingLogs.push(errorLog);
        // Keep only last 10 errors
        if (existingLogs.length > 10) {
          existingLogs.shift();
        }
        localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
      } catch (e) {
        console.error('Failed to save error log:', e);
      }
    }
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-danger-600" />
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-secondary-600 mb-6">
                We encountered an unexpected error. Don&apos;t worry, we&apos;ve logged this issue and will work on fixing it.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-secondary-100 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-secondary-700">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-secondary-600 mt-2 overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 px-6 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 rounded-lg transition-colors duration-200"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Home</span>
                </button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-secondary-500 mt-6">
                If this problem persists, please{' '}
                <button
                  onClick={() => {
                    // This would open the feedback modal in a real implementation
                    const feedbackButton = document.querySelector('[aria-label="Send feedback"]') as HTMLButtonElement;
                    if (feedbackButton) {
                      feedbackButton.click();
                    }
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  report this issue
                </button>
                {' '}to help us improve.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}