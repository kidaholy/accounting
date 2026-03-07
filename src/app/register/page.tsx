'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        businessName: '',
        businessEmail: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message);
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
                <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, background: 'rgba(203,104,67,0.2)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative', zIndex: 1 }}>
                    <img src="/images/hisabe logo.jpg" alt="Hisabe Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.125rem' }}>Hisabe</span>
                </div>

                {/* Branding Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                        Join the Future of<br />
                        <span style={{ color: '#CB6843' }}>Ethiopian Finance</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '1rem', maxWidth: 380 }}>
                        Start managing your business with the most advanced, tax-compliant accounting system built for our local market.
                    </p>

                    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Automated VAT Declarations', 'Fixed Asset Schedules', 'Stock Inventory Tracking'].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontSize: '0.9375rem', fontWeight: 600 }}>
                                <div style={{ width: 6, height: 6, background: '#CB6843', borderRadius: '50%' }} />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', position: 'relative', zIndex: 1 }}>
                    © 2026 Hisabe Inc. All rights reserved.
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
                <div style={{ width: '100%', maxWidth: 480 }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#7A7A7A', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2.5rem' }}>
                        ← Back to home
                    </Link>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: 20, border: '1.5px solid #E2DFD4' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.75rem' }}>Registration Successful!</h1>
                            <p style={{ color: '#7A7A7A', lineHeight: 1.6 }}>Your business has been registered. Redirecting you to login...</p>
                        </div>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Create your account</h1>
                            <p style={{ color: '#7A7A7A', marginBottom: '2.5rem', fontSize: '0.9375rem' }}>Get started with your 14-day professional trial.</p>

                            {error && (
                                <div style={{ background: 'rgba(217,79,61,0.08)', border: '1.5px solid rgba(217,79,61,0.25)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', color: '#D94F3D', fontSize: '0.875rem', fontWeight: 600 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Name</label>
                                    <input name="businessName" placeholder="e.g. Addis Tech Solutions" value={formData.businessName} onChange={handleChange} required
                                        style={{ padding: '0.8125rem 1rem', border: '1.5px solid #E2DFD4', borderRadius: 10, fontSize: '0.9375rem', outline: 'none' }} />
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Email</label>
                                    <input name="businessEmail" type="email" placeholder="billing@addistech.com" value={formData.businessEmail} onChange={handleChange} required
                                        style={{ padding: '0.8125rem 1rem', border: '1.5px solid #E2DFD4', borderRadius: 10, fontSize: '0.9375rem', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Name</label>
                                    <input name="adminName" placeholder="Your Name" value={formData.adminName} onChange={handleChange} required
                                        style={{ padding: '0.8125rem 1rem', border: '1.5px solid #E2DFD4', borderRadius: 10, fontSize: '0.9375rem', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Email</label>
                                    <input name="adminEmail" type="email" placeholder="admin@addistech.com" value={formData.adminEmail} onChange={handleChange} required
                                        style={{ padding: '0.8125rem 1rem', border: '1.5px solid #E2DFD4', borderRadius: 10, fontSize: '0.9375rem', outline: 'none' }} />
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                                    <input name="adminPassword" type="password" placeholder="••••••••" value={formData.adminPassword} onChange={handleChange} required
                                        style={{ padding: '0.8125rem 1rem', border: '1.5px solid #E2DFD4', borderRadius: 10, fontSize: '0.9375rem', outline: 'none' }} />
                                </div>

                                <button type="submit" disabled={loading}
                                    style={{ gridColumn: 'span 2', padding: '1rem', background: '#2A4A3E', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(42,74,62,0.2)' }}>
                                    {loading ? 'Creating account...' : 'Create Business Account'}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#7A7A7A' }}>
                                Already have an account? <Link href="/login" style={{ color: '#CB6843', fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
