import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LiveMonitor() {
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [timePassed, setTimePassed] = useState(0);
  
  // Real live data state (starts empty / 0)
  const [promptsList, setPromptsList] = useState([]);
  const [toolStats, setToolStats] = useState({
    ChatGPT: 0,
    Claude: 0,
    Perplexity: 0
  });
  const [avgPromptQuality, setAvgPromptQuality] = useState(0);
  const [alerts, setAlerts] = useState([]);

  // Timer for session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimePassed(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll GET /health every 3 seconds to check backend connection status
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

    checkHealth();
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
          if (data) {
            // Update prompts list
            const fetchedPrompts = data.prompts || [];
            setPromptsList(fetchedPrompts);

            // Update average prompt quality
            if (fetchedPrompts.length > 0) {
              const sum = fetchedPrompts.reduce((acc, curr) => acc + (curr.score || 0), 0);
              setAvgPromptQuality(Math.round(sum / fetchedPrompts.length));
            } else {
              setAvgPromptQuality(0);
            }

            // Update tool stats dynamically using tool_counts
            const counts = data.tool_counts || { ChatGPT: 0, Claude: 0, Perplexity: 0 };
            const total = (counts.ChatGPT || 0) + (counts.Claude || 0) + (counts.Perplexity || 0);
            
            if (total > 0) {
              setToolStats({
                ChatGPT: Math.round(((counts.ChatGPT || 0) / total) * 100),
                Claude: Math.round(((counts.Claude || 0) / total) * 100),
                Perplexity: Math.round(((counts.Perplexity || 0) / total) * 100)
              });
            } else {
              setToolStats({ ChatGPT: 0, Claude: 0, Perplexity: 0 });
            }

            // Build dynamic insights based on active tool and actual prompt warnings
            const newAlerts = [];
            if (data.current_tool && data.current_tool !== "None") {
              newAlerts.push({
                id: 'tool-alert',
                text: `Active Tool: FlowLens detected you are currently using ${data.current_tool}.`
              });
            }
            // Add lessons from latest prompt as warnings
            if (fetchedPrompts.length > 0 && fetchedPrompts[0].lessons) {
              fetchedPrompts[0].lessons.forEach((lesson, index) => {
                newAlerts.push({
                  id: `lesson-alert-${index}`,
                  text: lesson
                });
              });
            }
            setAlerts(newAlerts);
          }
        }
      } catch (err) {
        console.error("Error polling live prompts:", err);
      }
    };

    fetchLivePrompts(); // initial fetch
    const dataInterval = setInterval(fetchLivePrompts, 3000); // Poll every 3 seconds to be super real-time
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
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>
          System Connection: {online ? 'Online' : 'Reconnecting...'}
        </span>
        <span style={{ marginLeft: 'auto', fontWeight: '700' }}>
          Duration: {formatTime(timePassed)}
        </span>
      </div>

      <div className="monitor-container">
        {/* Left Side: Tool Usage */}
        <div className="card chart-section">
          <h2>Tool Usage Allocation</h2>
          <div className="chart-row">
            <div className="chart-header">
              <span>ChatGPT</span>
              <span>{toolStats.ChatGPT}%</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${toolStats.ChatGPT}%` }}></div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-header">
              <span>Claude</span>
              <span>{toolStats.Claude}%</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${toolStats.Claude}%` }}></div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-header">
              <span>Perplexity</span>
              <span>{toolStats.Perplexity}%</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${toolStats.Perplexity}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right Side: Score & Active Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2>Live Prompt Quality</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.75rem 0', fontWeight: '700' }}>
              <span>Average Grade</span>
              <span>{avgPromptQuality}/100</span>
            </div>
            <div className="bar-bg" style={{ height: '16px' }}>
              <div className="bar-fill" style={{ width: `${avgPromptQuality}%`, backgroundColor: 'var(--accent-cool)' }}></div>
            </div>
          </div>

          <div className="card">
            <h2>Active Insights</h2>
            <div className="alerts-list" style={{ marginTop: '1rem' }}>
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className="alert-card">
                    <span>⚠️</span>
                    <span>{alert.text}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>FlowLens is listening... Use an AI tool to trigger live insights.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Prompts Timeline section (100% real-time prompts) */}
      <div className="card" style={{ marginTop: '2.5rem' }}>
        <h2>Captured Prompt Stream</h2>
        {promptsList.length > 0 ? (
          <div className="results-list" style={{ marginTop: '1.5rem' }}>
            {promptsList.map(p => (
              <div key={p.id} className="result-item">
                <div className="result-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-active">{p.time}</span>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                      Prompt Grade: <span style={{ color: p.score >= 70 ? 'var(--accent-cool)' : 'var(--accent-pink)' }}>{p.score}/100</span>
                    </span>
                  </div>
                </div>
                
                <div style={{ margin: '1rem 0' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Original Prompt:</p>
                  <p style={{ fontStyle: 'italic', fontSize: '1rem', marginTop: '4px' }}>"{p.original}"</p>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-cool)', textTransform: 'uppercase' }}>FlowLens Suggested Prompt:</p>
                  <p style={{ fontWeight: '600', fontSize: '1rem', marginTop: '4px', color: 'var(--dark)' }}>"{p.improved}"</p>
                </div>

                {p.lessons && p.lessons.length > 0 && (
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Key Takeaways:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.95rem' }}>
                      {p.lessons.map((lesson, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{lesson}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '1.5rem' }}>
            No prompts recorded in this session yet. Type a query in ChatGPT/Claude and watch FlowLens capture it instantly!
          </p>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
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
