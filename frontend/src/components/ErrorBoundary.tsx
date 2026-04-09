import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Sentry } from '../lib/sentry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="text-left mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                <p className="font-semibold text-red-700 mb-2">Error:</p>
                <pre className="text-red-600 overflow-auto whitespace-pre-wrap text-xs break-all">
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <pre className="text-red-400 overflow-auto whitespace-pre-wrap text-xs break-all mt-2">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
