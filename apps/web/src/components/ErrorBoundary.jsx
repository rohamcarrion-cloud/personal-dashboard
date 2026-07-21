import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-destructive mb-2">Something went wrong</h2>
            <p className="text-sm text-destructive/80 mb-4">
              An unexpected error occurred in the application.
            </p>
            <div className="text-left bg-background/50 p-4 rounded-lg overflow-auto text-xs text-foreground/80 max-h-48">
              {this.state.error && this.state.error.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;