import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Report() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState('');
  const [score, setScore] = useState(74);
  const [mismatches, setMismatches] = useState([
    { id: 1, text: 'Used ChatGPT instead of Claude for complex React application structure analysis.' },
    { id: 2, text: 'Used Midjourney instead of DALL-E for UI design references (Midjourney resulted in slower iteration).' }
  ]);

  const videoId = searchParams.get('id') || localStorage.getItem('flowlens_video_id') || 'latest-session';

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/report/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          // Assume backend returns { report: "Markdown or text string" }
          if (data && data.report) {
            setReportText(data.report);
            
            // Try to extract a score if present in the text (e.g. "Score: 85")
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
    <div className="report-page">
      <div className="hero" style={{ marginBottom: '2rem' }}>
        <h1>Session Intelligence Report</h1>
        <p>EOD analysis and recommendations for session ID: <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{videoId}</span></p>
      </div>

      <div className="circle-wrapper">
        <div className="circle-score">
          <span className="circle-score-val">{score}</span>
          <span className="circle-score-lbl">Mastery Score</span>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '3rem' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2>FlowLens AI Report Analysis</h2>
          {loading ? (
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Analyzing session recording logs locally with Ollama...</p>
          ) : reportText ? (
            <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
              {reportText}
            </div>
          ) : (
            <div style={{ marginTop: '1rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
              <p>Excellent focus on technical programming tasks today. You relied primarily on Llama 3.2 for fast prompt verification, which helped maintain a rapid iteration cycle.</p>
              <br />
              <h3>Key Observations:</h3>
              <p>• Prompts were contextual and included exact error outputs.</p>
              <p>• High success rate on first-attempt debugging queries.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2>3 Actionable Tips</h2>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-num">1</span>
                <span>Include precise error stacks in your first prompt rather than descriptions.</span>
              </div>
              <div className="tip-item">
                <span className="tip-num">2</span>
                <span>Swap Perplexity for ChatGPT when seeking code examples; ChatGPT has better formatting.</span>
              </div>
              <div className="tip-item">
                <span className="tip-num">3</span>
                <span>Synthesize system outputs before modifying files to avoid code breakages.</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Tool Mismatches</h2>
            <div className="tips-list" style={{ margin: 0 }}>
              {mismatches.map(m => (
                <div key={m.id} className="tip-item" style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>•</span>
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
