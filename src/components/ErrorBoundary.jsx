import { Component } from 'react';

// Shows the real error on screen instead of a blank white page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#001431', background: '#F7F3EC', minHeight: '100vh' }}>
        <h1 style={{ fontSize: 22, margin: '0 0 12px' }}>Something went wrong</h1>
        <p style={{ margin: '0 0 12px' }}>Please call 760-201-1169 to book while we fix this.</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#fff', border: '1px solid #e3dacb', borderRadius: 8, padding: 12 }}>
          {String(error && (error.stack || error.message || error))}
        </pre>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.clear();
            } catch {
              /* ignore */
            }
            window.location.href = '/';
          }}
          style={{ marginTop: 12, padding: '10px 18px', borderRadius: 999, border: 0, background: '#0B2A5B', color: '#fff', fontWeight: 700 }}
        >
          Reset and go home
        </button>
      </div>
    );
  }
}
