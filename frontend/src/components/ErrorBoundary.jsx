import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '36px',
              textAlign: 'center',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderTop: '5px solid var(--rose-primary, #f43f5e)',
              borderRadius: 'var(--radius-md, 12px)',
              background: 'rgba(15, 23, 42, 0.95)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <AlertTriangle size={32} color="#f43f5e" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
              Evaluation Screen Recovery
            </h3>

            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              A rendering error occurred during this assessment phase. Your session data has been preserved, and you can recover without losing your progress.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm, 8px)',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  color: '#fda4af',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                }}
              >
                <RotateCcw size={16} />
                <span>Recover & Continue</span>
              </button>

              <button
                onClick={this.handleReload}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                }}
              >
                <Home size={16} />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
