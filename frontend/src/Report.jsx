import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Report() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState('');
  const [score, setScore] = useState(74);
  const [copied, setCopied] = useState(false);
  const [mismatches, setMismatches] = useState([
    { id: 1, text: 'Used ChatGPT for complex code organization (suggest: Claude for structured output).' },
    { id: 2, text: 'Used Claude for factual real-time search queries (suggest: Perplexity for fresh web citations).' }
  ]);

  const videoId = searchParams.get('id') || localStorage.getItem('flowlens_video_id') || 'latest-session';

  // Truncate session ID for clean layout
  const shortId = videoId.length > 24 
    ? `${videoId.slice(0, 8)}...${videoId.slice(-6)}` 
    : videoId;

  const handleCopyId = () => {
    navigator.clipboard.writeText(videoId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/report/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.report) {
            setReportText(data.report);
            const scoreMatch = data.report.match(/Score:?\s*(\d+)/i) || data.report.match(/(\d+)\/100/);
            if (scoreMatch) {
              setScore(parseInt(scoreMatch[1]));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load report from backend, displaying mock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [videoId]);

  return (
    <div className="report-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Short & Crisp Header Section */}
      <div className="hero" style={{ padding: '2rem 1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Session Report</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '0.75rem' }}>
          <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            ID: {shortId}
          </span>
          <button 
            onClick={handleCopyId}
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--dark)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--dark)'
            }}
          >
            {copied ? 'Copied! ✅' : 'Copy Full ID 📋'}
          </button>
        </div>
      </div>

      {/* Main Two-Column Clean Grid Layout */}
      <div className="monitor-container" style={{ gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Score & AI Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '1.2' }}>
          
          {/* Integrated Compact Score Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem 2rem' }}>
            <div className="circle-score" style={{ width: '100px', height: '100px', outlineWidth: '6px', flexShrink: 0, margin: 0 }}>
              <span className="circle-score-val" style={{ fontSize: '2.2rem' }}>{score}</span>
              <span className="circle-score-lbl" style={{ fontSize: '0.65rem' }}>Grade</span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Session Mastery</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                Your overall AI tool competency based on tool selection accuracy, prompt depth, and local speed evaluation.
              </p>
            </div>
          </div>

          {/* AI Report Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2>FlowLens AI Analysis</h2>
            {loading ? (
              <p style={{ marginTop: '1rem', color: 'var(--muted)', fontWeight: '600' }}>
                Analyzing session recording logs locally with Ollama...
              </p>
            ) : reportText ? (
              <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--dark)' }}>
                {reportText}
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p style={{ fontWeight: '500', color: 'var(--dark)' }}>
                  Excellent programming focus today. You relied primarily on local models to run diagnostics, maintaining a fast cycle.
                </p>
                <div style={{ marginTop: '1.25rem', borderTop: '2px dashed var(--dark)', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Key Observations:</h3>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>Exact error logs were appended directly inside initial prompt.</li>
                    <li>Fast debugging loop with zero context switching.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Short Actionable Tips & Mismatches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '0.8' }}>
          
          {/* Actionable Tips */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2>Actionable Tips</h2>
            <div className="tips-list" style={{ gap: '1rem', marginTop: '1rem' }}>
              <div className="tip-item">
                <span className="tip-num" style={{ width: '24px', height: '24px', fontSize: '0.9rem' }}>1</span>
                <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>Include direct stack traces in prompts instead of descriptions.</span>
              </div>
              <div className="tip-item">
                <span className="tip-num" style={{ width: '24px', height: '24px', fontSize: '0.9rem' }}>2</span>
                <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>Use ChatGPT for syntax correction, Claude for app architecture.</span>
              </div>
              <div className="tip-item">
                <span className="tip-num" style={{ width: '24px', height: '24px', fontSize: '0.9rem' }}>3</span>
                <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>Review system outputs before editing core workspace files.</span>
              </div>
            </div>
          </div>

          {/* Tool Mismatches */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2>Tool Mismatches</h2>
            <div className="alerts-list" style={{ marginTop: '1rem', gap: '10px' }}>
              {mismatches.map(m => (
                <div key={m.id} className="alert-card" style={{ padding: '0.9rem 1.1rem', fontSize: '0.9rem', boxShadow: '2px 2px 0 var(--dark)' }}>
                  <span>⚠️</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
