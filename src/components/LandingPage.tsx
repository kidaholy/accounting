"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LandingPageProps {
    user?: {
        name?: string | null;
        email?: string | null;
    };
}

export default function LandingPage({ user }: LandingPageProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-container">
            {/* Background Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-content">
                    <div className="logo">
                        <span className="logo-text">Accounting<span className="text-cyan">System</span></span>
                    </div>

                    <div className="nav-links">
                        <Link href="#features">Features</Link>
                        <Link href="#about">About Us</Link>
                        <Link href="#pricing">Pricing</Link>
                    </div>

                    <div className="nav-actions">
                        {user ? (
                            <Link href="/dashboard" className="btn-pill btn-cyan">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="nav-link">Login</Link>
                                <Link href="/login" className="btn-pill btn-outline">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="badge animate-fade-in">
                        ✨ #1 Modern Accounting Solution
                    </div>

                    <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Easiest way to <span className="highlight-box">manage</span> <br />
                        your business <span className="text-cyan">finance</span>
                    </h1>

                    <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Streamline your fixed assets, VAT declarations, and stock inventory with our powerful, automated platform. Built for modern businesses.
                    </p>

                    <div className="hero-btns animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <Link href={user ? "/dashboard" : "/login"} className="btn-pill btn-cyan btn-large">
                            {user ? "Go to Dashboard" : "Start Free Trial"}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href="#features" className="btn-pill btn-glass btn-large">
                            Learn More
                        </Link>
                    </div>
                </div>

                <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="mockup-container">
                        {/* Main Mockup Card */}
                        <div className="mockup-card glass-panel main-card">
                            <div className="card-header">
                                <div className="dots"><span></span><span></span><span></span></div>
                                <div className="title">Revenue Overview</div>
                            </div>
                            <div className="chart-placeholder">
                                <div className="bar" style={{ height: '40%' }}></div>
                                <div className="bar" style={{ height: '70%' }}></div>
                                <div className="bar" style={{ height: '55%' }}></div>
                                <div className="bar" style={{ height: '90%' }}></div>
                                <div className="bar" style={{ height: '65%' }}></div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="floating-card glass-panel float-1">
                            <div className="icon">💰</div>
                            <div>
                                <div className="label">Total Balance</div>
                                <div className="value">$45,231.89</div>
                            </div>
                        </div>

                        <div className="floating-card glass-panel float-2">
                            <div className="icon">✅</div>
                            <div>
                                <div className="label">VAT Status</div>
                                <div className="value text-success">Compliant</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner bar */}
            <div className="partners-section">
                <div className="partners-bar animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <span className="partner">Trusted By</span>
                    <div className="partner-logos">
                        <span className="logo-placeholder">NextJS</span>
                        <span className="logo-placeholder">Vercel</span>
                        <span className="logo-placeholder">MongoDB</span>
                        <span className="logo-placeholder">AuthJS</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background-color: #0b0b14;
          color: #ffffff;
          overflow-x: hidden;
          position: relative;
        }

        /* Blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.15;
        }
        .blob-1 {
          width: 400px;
          height: 400px;
          background: #48e5e5;
          top: -100px;
          right: -100px;
        }
        .blob-2 {
          width: 500px;
          height: 500px;
          background: #ff9f43;
          bottom: 10%;
          left: -150px;
        }
        .blob-3 {
          width: 300px;
          height: 300px;
          background: #9333ea;
          top: 40%;
          right: 15%;
        }

        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1.5rem 0;
          transition: all 0.3s ease;
        }
        .landing-nav.scrolled {
          padding: 1rem 0;
          background: rgba(11, 11, 20, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .text-cyan { color: #48e5e5; }

        .nav-links {
          display: flex;
          gap: 2.5rem;
        }
        .nav-links a {
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #ffffff; }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
        }

        .btn-pill {
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-large { padding: 1rem 2rem; font-size: 1.125rem; }
        .btn-cyan { background: #48e5e5; color: #0b0b14; }
        .btn-cyan:hover { background: #3ad1d1; transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(72, 229, 229, 0.5); }
        .btn-outline { border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; }
        .btn-outline:hover { background: rgba(255, 255, 255, 0.05); border-color: #ffffff; }
        .btn-glass { 
          background: rgba(255, 255, 255, 0.05); 
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .btn-glass:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }

        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10rem 2rem 5rem;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(72, 229, 229, 0.1);
          border: 1px solid rgba(72, 229, 229, 0.2);
          color: #48e5e5;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 4rem;
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -0.04em;
        }

        .highlight-box {
          position: relative;
          display: inline-block;
          padding: 0 0.5rem;
          z-index: 1;
        }
        .highlight-box::after {
          content: '';
          position: absolute;
          bottom: 10%;
          left: 0;
          width: 100%;
          height: 30%;
          background: #ff9f43;
          border-radius: 4px;
          z-index: -1;
          opacity: 0.8;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          margin-bottom: 3rem;
          max-width: 540px;
          line-height: 1.6;
        }

        .hero-btns {
          display: flex;
          gap: 1.5rem;
        }

        .hero-visual {
          position: relative;
          height: 500px;
        }

        .mockup-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .mockup-card {
          position: absolute;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          padding: 2rem;
        }

        .main-card {
          width: 320px;
          height: 450px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-5deg);
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .dots { display: flex; gap: 4px; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
        .title { font-size: 0.875rem; font-weight: 500; color: #94a3b8; }

        .chart-placeholder {
          height: 200px;
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding-bottom: 2rem;
        }
        .bar {
          flex: 1;
          background: linear-gradient(to top, #48e5e5, #9333ea);
          border-radius: 4px;
          opacity: 0.8;
        }

        .floating-card {
          position: absolute;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 2;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
        }

        .float-1 {
          top: 10%;
          right: 0%;
          transform: rotate(5deg);
        }
        .float-2 {
          bottom: 15%;
          left: 0%;
          transform: rotate(-10deg);
        }

        .icon { font-size: 1.5rem; }
        .label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 2px; }
        .value { font-size: 1.125rem; font-weight: 700; }
        .text-success { color: #10b981; }

        .partners-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .partners-bar {
          background: #ffffff;
          padding: 2rem 3rem;
          border-radius: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #0b0b14;
        }
        .partner { font-weight: 700; font-size: 1.25rem; opacity: 0.8; }
        .partner-logos {
          display: flex;
          gap: 3rem;
          font-weight: 800;
          font-size: 1.5rem;
          opacity: 0.3;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }

        @media (max-width: 968px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 8rem;
          }
          .hero-subtitle { margin: 0 auto 3rem; }
          .hero-btns { justify-content: center; }
          .hero-visual { display: none; }
          .nav-links { display: none; }
          .hero-title { font-size: 3rem; }
        }
      `}</style>
        </div>
    );
}
