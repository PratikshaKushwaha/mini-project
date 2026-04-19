import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-stone-50 rounded-xl m-4 border border-stone-200 shadow-sm">
          <h2 className="text-2xl font-playfair font-bold text-red-800 mb-4">Something went wrong</h2>
          <p className="text-stone-600 mb-6 max-w-md">
            We encountered an unexpected error displaying this part of the application. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#3d3028] text-white rounded-lg hover:bg-[#2a211b] transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
