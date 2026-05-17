import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/session/start', {
        method: 'POST',
      });
      if (res.ok) {
        navigate('/monitor');
      } else {
        throw new Error('Could not start session.');
      }
    } catch (err) {
      console.error(err);
      setError('Backend connection failed. Navigating to monitor anyway (Demo Mode).');
      setTimeout(() => {
        navigate('/monitor');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Your AI productivity, finally visible</h1>
        <p>Monitor tools, grade prompt quality, and unlock actionable EOD performance intelligence.</p>
        <div style={{ margin: '1.5rem 0' }}>
          <span className="handwritten-accent">Hi, I'm FlowLens! 👁️</span>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleStartSession}
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Session'}
        </button>
        {error && <p style={{ color: 'var(--accent-cool)', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}
      </section>

      <section className="grid-3">
        <div className="card">
          <div className="card-title">AI Mastery Score</div>
          <div className="card-value">74/100</div>
        </div>
        <div className="card">
          <div className="card-title">Time Saved</div>
          <div className="card-value">1h 45m</div>
        </div>
        <div className="card">
          <div className="card-title">Prompt Quality</div>
          <div className="card-value">68%</div>
        </div>
      </section>
    </div>
  );
}
