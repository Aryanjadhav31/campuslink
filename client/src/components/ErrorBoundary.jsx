import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
          <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-2xl">
            <div className="mb-4 text-6xl">😅</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Something went wrong</h2>
            <p className="mb-4 text-gray-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.errorInfo && (
              <details className="p-3 mb-4 text-sm text-left rounded-lg bg-gray-50">
                <summary className="text-gray-600 cursor-pointer">Error Details</summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600 whitespace-pre-wrap max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
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

export default ErrorBoundary;