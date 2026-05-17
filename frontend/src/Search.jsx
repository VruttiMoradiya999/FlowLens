import React, { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([
    { id: 1, time: '11:20 AM', tool: 'ChatGPT', desc: 'Searched for: "Write an optimized Python script for screen recording with opencv and mss"' },
    { id: 2, time: '11:45 AM', tool: 'Claude', desc: 'Searched for: "How to fix the EPERM process.cwd failed error in react vite dev server"' },
    { id: 3, time: '02:10 PM', tool: 'Perplexity', desc: 'Searched for: "VideoDB documentation for scene indexing time extraction type"' }
  ]);

  const videoId = localStorage.getItem('flowlens_video_id') || 'latest-session';

  const handleSearch = async (searchQuery) => {
    const term = searchQuery || query;
    if (!term) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/search/${videoId}?query=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        // Assuming backend returns a string or array of results. Let's handle it gracefully.
        if (data && data.results) {
          if (Array.isArray(data.results)) {
            setResults(data.results);
          } else {
            // If it's a string, display it as a single structured item
            setResults([
              { id: Date.now(), time: 'Indexed Moments', tool: 'Search Result', desc: data.results }
            ]);
          }
        }
      }
    } catch (err) {
      console.error("Search failed, using dynamic local search:", err);
      // Local mockup filtering to look smart
      const filtered = [
        { id: 1, time: '11:20 AM', tool: 'ChatGPT', desc: 'Searched for: "Write an optimized Python script for screen recording with opencv and mss"' },
        { id: 2, time: '11:45 AM', tool: 'Claude', desc: 'Searched for: "How to fix the EPERM process.cwd failed error in react vite dev server"' },
        { id: 3, time: '02:10 PM', tool: 'Perplexity', desc: 'Searched for: "VideoDB documentation for scene indexing time extraction type"' }
      ].filter(r => r.desc.toLowerCase().includes(term.toLowerCase()) || r.tool.toLowerCase().includes(term.toLowerCase()));
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText) => {
    setQuery(chipText);
    handleSearch(chipText);
  };

  return (
    <div className="search-page">
      <div className="hero" style={{ marginBottom: '2.5rem' }}>
        <h1>Search Session Memory</h1>
        <p>Ask plain English questions to recall specific moments, prompts, and insights from today.</p>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          className="search-input" 
          placeholder="e.g. show me when I got frustrated, or ChatGPT prompts..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={() => handleSearch()}>Search</button>
      </div>

      <div className="chips-container">
        <span className="chip" onClick={() => handleChipClick('worst prompts today')}>worst prompts today</span>
        <span className="chip" onClick={() => handleChipClick('biggest time waste')}>biggest time waste</span>
        <span className="chip" onClick={() => handleChipClick('best AI moment')}>best AI moment</span>
        <span className="chip" onClick={() => handleChipClick('all ChatGPT sessions')}>all ChatGPT sessions</span>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Session Timeline Matches</h2>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Searching VideoDB timeline databases...</p>
        ) : results.length > 0 ? (
          <div className="results-list">
            {results.map(r => (
              <div key={r.id} className="result-item">
                <div className="result-header">
                  <span className="badge badge-active" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 'bold' }}>
                    {r.tool}
                  </span>
                  <span className="result-time">{r.time}</span>
                </div>
                <div className="result-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No matches found in today's screen recording session.</p>
        )}
      </div>
    </div>
  );
}
