import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LiveMonitor() {
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [timePassed, setTimePassed] = useState(0);
  const [liveData, setLiveData] = useState({
    chatgpt: 67,
    claude: 18,
    perplexity: 5,
    promptQuality: 72,
    alerts: [
      { id: 1, text: 'Tool Mismatch: Used ChatGPT for complex coding task (suggest: Claude).' },
      { id: 2, text: 'Vague Prompt: "fix this code" without system context or error stack.' }
    ]
  });

  // Timer for session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimePassed(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll GET /health every 3 seconds to stay live
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8000/health');
        if (res.ok) {
          setOnline(true);
        } else {
          setOnline(false);
        }
      } catch (err) {
        setOnline(false);
      }
    };

    checkHealth(); // initial check
    const healthInterval = setInterval(checkHealth, 3000);
    return () => clearInterval(healthInterval);
  }, []);

  // Real-time backend live data polling
  useEffect(() => {
    const fetchLivePrompts = async () => {
      try {
        const res = await fetch('http://localhost:8000/live_prompts');
        if (res.ok) {
          const data = await res.json();
          if (data && data.prompts && data.prompts.length > 0) {
            // Update live metrics from real analyzer data
            const latest = data.prompts[0];
            setLiveData(prev => ({
              ...prev,
              promptQuality: latest.score || prev.promptQuality,
              alerts: latest.lessons.length > 0 
                ? latest.lessons.map((lbl, idx) => ({ id: idx + 3, text: lbl }))
                : prev.alerts
            }));
          }
        }
      } catch (err) {
        console.error("Error polling live prompts:", err);
      }
    };

    const dataInterval = setInterval(fetchLivePrompts, 5000);
    return () => clearInterval(dataInterval);
  }, []);

  const handleStopSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/session/stop', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        const videoId = data.video_id || 'demo-video-id';
        localStorage.setItem('flowlens_video_id', videoId);
        navigate(`/report?id=${videoId}`);
      } else {
        throw new Error('Stop session failed');
      }
    } catch (err) {
      console.error(err);
      // Fallback demo redirect
      const demoId = 'demo-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('flowlens_video_id', demoId);
      navigate(`/report?id=${demoId}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="live-monitor-page">
      <div className="badge-row">
        <span className="badge badge-active">
          <span className="badge-pulse"></span>
          Session Active
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          System Connection: {online ? 'Online' : 'Reconnecting...'}
        </span>
        <span style={{ marginLeft: 'auto', fontWeight: '600' }}>
          Duration: {formatTime(timePassed)}
        </span>
      </div>

      <div className="monitor-container">
        <div className="card chart-section">
          <h2>Tool Usage Allocation</h2>
          <div className="chart-row">
            <div className="chart-header">
              <span>ChatGPT</span>
              <span>{liveData.chatgpt}%</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${liveData.chatgpt}%` }}></div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-header">
              <span>Claude</span>
              <span>{liveData.claude}%</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${liveData.claude}%` }}></div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-header">
              <span>Perplexity</span>
              <span>{liveData.perplexity}%</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${liveData.perplexity}%` }}></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2>Live Prompt Quality</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0', fontWeight: '600' }}>
              <span>Average Grade</span>
              <span>{liveData.promptQuality}/100</span>
            </div>
            <div className="bar-bg" style={{ height: '12px' }}>
              <div className="bar-fill" style={{ width: `${liveData.promptQuality}%`, backgroundColor: 'var(--accent)' }}></div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Active Insights</h2>
            <div className="alerts-list">
              {liveData.alerts.map(alert => (
                <div key={alert.id} className="alert-card">
                  <span>⚠️</span>
                  <span>{alert.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button 
          className="btn btn-danger" 
          onClick={handleStopSession}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Stop & Analyze Session'}
        </button>
      </div>
    </div>
  );
}
