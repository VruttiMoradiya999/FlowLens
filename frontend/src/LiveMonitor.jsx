import React, { useState, useEffect } from 'react';
import { Eye, Code, Zap, Clock, Square, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveMonitor() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [liveData, setLiveData] = useState({
    currentTool: 'None',
    taskType: 'Idle',
    promptQuality: 0
  });

  // Handle session timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSessionTime(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Poll live data
  useEffect(() => {
    let pollInterval = null;
    if (isActive) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8000/live_prompts');
          const data = await res.json();
          if (data && data.current_tool) {
            setLiveData({
              currentTool: data.current_tool,
              taskType: data.prompts.length > 0 ? 'Research/Writing' : 'Idle',
              promptQuality: data.prompts.length > 0 ? data.prompts[0].score : 0
            });
          }
        } catch (e) {
          console.error("Error fetching live data", e);
        }
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(pollInterval);
  }, [isActive]);

  const handleStart = async () => {
    try {
      await fetch('http://localhost:8000/session/start', { method: 'POST' });
      setIsActive(true);
      setSessionTime(0);
    } catch (e) {
      console.error("Start error", e);
      setIsActive(true); // Fallback for UI demo
    }
  };

  const handleStop = async () => {
    setIsActive(false);
    setIsProcessing(true);
    try {
      await fetch('http://localhost:8000/session/stop', { method: 'POST' });
      // Simulate indexing time then navigate to report
      setTimeout(() => {
        setIsProcessing(false);
        localStorage.setItem('flowlens_report', 'true');
        navigate('/report');
      }, 3000);
    } catch (e) {
      console.error("Stop error", e);
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="glass-card">
      <header className="card-header">
        <div className={`icon-container eye-icon ${isActive ? 'pulse' : ''}`}>
          <Eye size={28} color="#ff3d8b" />
        </div>
        <div className="header-text">
          <h2>FlowLens is {isActive ? 'watching...' : 'sleeping'}</h2>
          <div className="status-indicator">
            <span className={`dot ${isActive ? 'pulse-dot' : ''}`} style={{ backgroundColor: isActive ? '#00c9a7' : '#ff3d8b' }}></span>
            <span className="status-text" style={{ color: isActive ? '#00c9a7' : '#ff3d8b' }}>
              {isActive ? 'LIVE RECORDING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <div className="card-content">
        <div className="section-title">Current Activity</div>
        
        <div className="info-row">
          <div className="icon-wrapper"><Zap size={18} /></div>
          <span className="label">Current Tool</span>
          <span className="value tool-name">{isActive ? liveData.currentTool : 'None'}</span>
        </div>

        <div className="info-row">
          <div className="icon-wrapper"><Code size={18} /></div>
          <span className="label">Task Type</span>
          <span className="value">{isActive ? liveData.taskType : 'Idle'}</span>
        </div>

        <div className="info-row">
          <div className="icon-wrapper"><Clock size={18} /></div>
          <span className="label">Session Time</span>
          <span className="value time">{formatTime(sessionTime)}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <div className="progress-title">
            <CheckCircle2 size={16} className="icon" />
            <span className="label">Live Prompt Quality</span>
          </div>
          <span className="percentage">{isActive ? liveData.promptQuality : 0}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill tool-live" 
            style={{ width: `${isActive ? liveData.promptQuality : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="session-buttons">
        {!isActive ? (
          <button className="session-btn start-btn" onClick={handleStart} disabled={isProcessing}>
            <Play size={18} className="btn-icon" />
            <span>Start Session</span>
          </button>
        ) : (
          <button className="session-btn stop-btn" onClick={handleStop}>
            <Square size={18} className="btn-icon" />
            <span>Stop & Get Report</span>
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="processing-note">
          Indexing session & analyzing data... 
        </div>
      )}
    </div>
  );
}
