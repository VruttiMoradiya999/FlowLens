import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleStartSession = async () => {
    setShowModal(false);
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
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Session'}
        </button>
        {error && <p style={{ color: 'var(--accent-cool)', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}
      </section>

      {/* Playful Permission Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              <span>👁️</span> Allow Screen Capture?
            </h2>
            <p className="modal-desc">
              FlowLens is ready to read and analyze your AI interactions in real-time. 
              Everything runs 100% locally and securely on your Mac—no cloud uploads, fully private!
            </p>
            <div className="modal-tip">
              <strong>💡 Pro Tip:</strong> Make sure screen recording permissions are toggled ON for <strong>VS Code</strong> or <strong>Terminal</strong> in your Mac System Settings!
            </div>
            <div className="modal-actions">
              <button 
                className="btn" 
                style={{ borderRadius: '999px', boxShadow: 'none' }}
                onClick={() => setShowModal(false)}
              >
                Deny
              </button>
              <button 
                className="btn btn-primary" 
                style={{ borderRadius: '999px', boxShadow: 'none' }}
                onClick={handleStartSession}
              >
                Allow & Start
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid-3">
        <div className="card">
          <div className="card-title">AI Mastery Score</div>
          <div className="card-value">74/100</div>
        </div>
        <div className="card">
          <div className="card-title">Prompt Quality</div>
          <div className="card-value">68%</div>
        </div>
      </section>
    </div>
  );
}
