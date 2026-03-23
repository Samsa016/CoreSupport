import React from "react";
import "./page.module.css"; // We'll write some specific styles here if needed

export default function Home() {
  return (
    <div className="container">
      <nav className="navbar glass-panel">
        <div className="logo text-gradient">CoreSupport</div>
        <div className="nav-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Services</a>
          <a href="#" className="nav-link">Work</a>
          <a href="#" className="nav-link">Company</a>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary">Log In</button>
          <button className="btn-primary">Get Started</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <div className="badge glass-panel">
            <span className="badge-dot"></span>
            Elevating Digital Experiences
          </div>
          <h1 className="hero-title">
            The Next Generation of <br />
            <span className="text-gradient">Digital Excellence.</span>
          </h1>
          <p className="hero-subtitle">
            We build immersive, high-performance web applications that transform businesses 
            and captivate audiences globally.
          </p>
          <div className="hero-cta">
            <button className="btn-primary btn-lg">Start a Project</button>
            <button className="btn-secondary btn-lg">View Our Work</button>
          </div>
        </div>

        {/* Abstract 3D/Glow shapes for aesthetic */}
        <div className="glow-orb primary-orb"></div>
        <div className="glow-orb secondary-orb"></div>
      </main>
    </div>
  );
}
