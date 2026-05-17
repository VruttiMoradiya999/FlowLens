import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import LiveMonitor from './LiveMonitor';
import Report from './Report';
import Search from './Search';
import './index.css';

function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-name">FlowLens</span>
        <span className="brand-dot"></span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/monitor" className={`nav-link ${location.pathname === '/monitor' ? 'active' : ''}`}>Live Monitor</Link>
        <Link to="/report" className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`}>Report</Link>
        <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>Search</Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/monitor" element={<LiveMonitor />} />
          <Route path="/report" element={<Report />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
    </Router>
  );
}
