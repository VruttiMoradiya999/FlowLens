import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Search, PlaySquare, ArrowUp, Zap } from 'lucide-react';

export default function DayReport() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [stats, setStats] = useState({
    score: 74, trend: 8,
    chatgpt: 67, claude: 18, perplexity: 5,
    mismatches: 3, quality: 68,
    tip: 'Try using Claude for coding instead of ChatGPT to reduce tool mismatches.'
  });

  useEffect(() => {
    // Check if the user just stopped a session and got a report
    const hasReport = localStorage.getItem('flowlens_report');
    if (hasReport && !selectedDate) {
      setStats({
        score: 88, trend: 14,
        chatgpt: 45, claude: 40, perplexity: 15,
        mismatches: 1, quality: 85,
        tip: 'Great job using Perplexity for that research task! Keep it up.'
      });
    }
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (!date) return;
    
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
      hash = (hash << 5) - hash + date.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);
    
    const chatgpt = 20 + (hash % 50);
    const claude = 15 + (hash % 40);
    const perplexity = 100 - chatgpt - claude;
    
    setStats({
      score: 60 + (hash % 35),
      trend: (hash % 20) - 10,
      chatgpt: chatgpt,
      claude: claude,
      perplexity: perplexity,
      mismatches: hash % 6,
      quality: 55 + (hash % 40),
      tip: hash % 2 === 0 
        ? 'Try to consolidate your searches to save time.' 
        : 'Excellent mix of tools used today!'
    });
  };

  const handleSearchClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (e) {
        // Fallback for browsers that don't support showPicker on date inputs
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="glass-card day-report">
      <header className="card-header">
        <div className="icon-container brain-icon">
          <Brain size={28} color="#00c9a7" />
        </div>
        <div className="header-text">
          <h2>YOUR AI DAY</h2>
          <div className="score-indicator">
            <span className="score-label">AI Mastery Score:</span>
            <span className="score-value">{stats.score}/100</span>
            <span className="score-trend"><ArrowUp size={14} strokeWidth={3} /> {stats.trend}</span>
          </div>
        </div>
      </header>

      <div className="day-report-body" style={{ display: 'flex', gap: '32px', marginBottom: '28px' }}>
        <div className="day-report-left" style={{ flex: 1 }}>
          <div className="card-content" style={{ marginBottom: 0 }}>
            <div className="section-title">Time by Tool</div>
            
            <div className="tool-bar-container">
              <div className="tool-bar-header">
                <span>ChatGPT</span>
                <span>{stats.chatgpt}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill tool-chatgpt" style={{ width: `${stats.chatgpt}%` }}></div>
              </div>
            </div>

            <div className="tool-bar-container">
              <div className="tool-bar-header">
                <span>Claude</span>
                <span>{stats.claude}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill tool-claude" style={{ width: `${stats.claude}%` }}></div>
              </div>
            </div>

            <div className="tool-bar-container">
              <div className="tool-bar-header">
                <span>Perplexity</span>
                <span>{stats.perplexity}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill tool-perplexity" style={{ width: `${stats.perplexity}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="day-report-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Clickable alerts */}
          <div className="alerts-section" style={{ marginBottom: 0 }}>
            <div
              className="alert-item warning clickable"
              onClick={() => navigate('/mismatches')}
              title="View mismatch details"
            >
              <AlertTriangle size={18} />
              <span>{stats.mismatches} Tool Mismatches Found</span>
              <span className="alert-arrow">→</span>
            </div>
            <div
              className="alert-item success clickable"
              onClick={() => navigate('/prompt-quality')}
              title="View prompt quality details"
            >
              <TrendingUp size={18} />
              <span>Prompt Quality: {stats.quality}/100</span>
              <span className="alert-arrow">→</span>
            </div>
          </div>

          <div className="tips-section" style={{ marginBottom: 0, flexGrow: 1 }}>
            <div className="tips-header">
              <Lightbulb size={18} color="#ff3d8b" />
              <span>Top Tips for Tomorrow</span>
            </div>
            <div className="tip-content">
              <Zap size={14} /> {stats.tip}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="action-button primary" 
          onClick={handleSearchClick}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <Search size={18} />
          <span>{selectedDate ? `Data for ${selectedDate}` : 'Search My Day'}</span>
          <input 
            type="date"
            ref={dateInputRef}
            onChange={handleDateChange}
            value={selectedDate}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              opacity: 0,
              width: '1px',
              height: '1px',
              pointerEvents: 'none'
            }}
          />
        </button>
        <button
          className="action-button secondary"
          onClick={() => navigate('/clips')}
        >
          <PlaySquare size={18} />
          <span>View Clips</span>
        </button>
      </div>
    </div>
  );
}
