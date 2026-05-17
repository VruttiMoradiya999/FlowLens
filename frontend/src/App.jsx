import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LiveMonitor from './LiveMonitor';
import DayReport from './DayReport';
import './App.css';
import './index.css';

export default function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-dot pink"></span>
          <span className="brand-dot teal"></span>
          <span className="brand-name">FlowLens</span>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Live Monitor</Link>
          <Link to="/report" className="nav-link">My AI Day</Link>
        </div>
      </nav>

      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={
            <div className="page-container wide">
              <h1 className="main-title">FlowLens Dashboard</h1>
              <LiveMonitor />
            </div>
          } />
          <Route path="/report" element={
            <div className="page-container wide">
              <h1 className="main-title">Your AI Day</h1>
              <DayReport />
            </div>
          } />
        </Routes>
      </main>
    </Router>
  );
}
