"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F3F1EA',
      display: 'flex',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Left Panel — Branding */}
      <div style={{
        width: '45%',
        background: '#2A4A3E',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blob */}
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, background: 'rgba(203,104,67,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative', zIndex: 1 }}>
          <img src="/images/hisabe logo.jpg" alt="Hisabe Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.125rem' }}>Hisabe</span>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Focus on Growing<br />
            <span style={{ color: '#CB6843' }}>Your Business,</span><br />
            Not on Accounting
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '0.9375rem', maxWidth: 360 }}>
            Manage assets, track VAT compliance, and monitor inventory — all from one professional platform built for Ethiopian businesses.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>
          {[
            { value: '500+', label: 'Businesses' },
            { value: '15%', label: 'VAT Rate Auto-Calc' },
            { value: '99.9%', label: 'Uptime' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ color: '#CB6843', fontWeight: 800, fontSize: '1.25rem' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Back to home */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#7A7A7A', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2.5rem' }}>
            ← Back to home
          </Link>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: '#7A7A7A', marginBottom: '2.5rem', fontSize: '0.9375rem' }}>Sign in to your Hisabe account</p>

          {error && (
            <div style={{
              background: 'rgba(217,79,61,0.08)',
              border: '1.5px solid rgba(217,79,61,0.25)',
              borderRadius: 10,
              padding: '0.875rem 1rem',
              marginBottom: '1.5rem',
              color: '#D94F3D',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. admin@example.com"
                required
                style={{
                  padding: '0.8125rem 1rem',
                  border: '1.5px solid #E2DFD4',
                  borderRadius: 10,
                  background: 'white',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A4A3E')}
                onBlur={e => (e.target.style.borderColor = '#E2DFD4')}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                <a href="#" style={{ fontSize: '0.8125rem', color: '#CB6843', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  padding: '0.8125rem 1rem',
                  border: '1.5px solid #E2DFD4',
                  borderRadius: 10,
                  background: 'white',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A4A3E')}
                onBlur={e => (e.target.style.borderColor = '#E2DFD4')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.9375rem',
                background: loading ? '#5A8A78' : '#2A4A3E',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '1rem',
                fontFamily: 'inherit',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(42,74,62,0.25)',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 12 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Demo Credentials</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { role: 'Super Admin', email: 'superadmin@example.com', pass: 'admin123' },
                { role: 'Accountant', email: 'accountant@example.com', pass: 'accountant123' },
              ].map(c => (
                <button key={c.role} onClick={() => { setEmail(c.email); setPassword(c.pass); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: '#F3F1EA', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#2A4A3E' }}>{c.role}</span>
                  <span style={{ fontSize: '0.75rem', color: '#7A7A7A' }}>Click to fill</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#7A7A7A' }}>
            New to Hisabe? <Link href="/register" style={{ color: '#CB6843', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
