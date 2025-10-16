import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <h3>⚠️ Something went wrong</h3>
                        <p>An unexpected error occurred in the timeline visualizer.</p>
                        
                        <details className="error-details">
                            <summary>Error Details</summary>
                            <div className="error-stack">
                                <strong>Error:</strong> {this.state.error?.message}
                                {this.state.errorInfo && (
                                    <>
                                        <br />
                                        <strong>Component Stack:</strong>
                                        <pre>{this.state.errorInfo.componentStack}</pre>
                                    </>
                                )}
                            </div>
                        </details>

                        <div className="error-actions">
                            <button 
                                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                                className="retry-button"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="reload-button"
                            >
                                Reload Extension
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}