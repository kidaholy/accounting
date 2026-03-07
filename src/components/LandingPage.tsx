"use client";

import Link from 'next/link';
import { Gem, BarChart3, Package, Users, Cloud, Smartphone, Handshake, Settings, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

// ─── Decorative SVG doodle components ─────────────────────────────────────────
const CurlArrow = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 10 C20 60, 60 60, 70 30" stroke="#2A4A3E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M65 22 L74 32 L58 36" stroke="#2A4A3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Sparkle = ({ color = "#CB6843", size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M14 2 L15.5 12.5 L26 14 L15.5 15.5 L14 26 L12.5 15.5 L2 14 L12.5 12.5 Z" fill={color} opacity="0.8" />
  </svg>
);

const WavyLine = () => (
  <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
    <path d="M2 12 C12 4, 22 20, 32 12 C42 4, 52 20, 62 12 C72 4, 82 20, 92 12 C102 4, 112 20, 118 12" stroke="#CB6843" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

const ProcessLine = () => (
  <svg width="100%" height="60" viewBox="0 0 700 60" fill="none" preserveAspectRatio="none">
    <path d="M60 30 C200 5, 300 55, 420 30 C540 5, 620 50, 660 30" stroke="#CB6843" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 4" fill="none" />
  </svg>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{
      background: 'white',
      border: '1.5px solid #E2DFD4',
      borderRadius: 16,
      padding: '1.75rem',
      boxShadow: '4px 4px 0px rgba(42,74,62,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px rgba(42,74,62,0.15)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px rgba(42,74,62,0.08)';
      }}
    >
      <div style={{ color: '#2A4A3E', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#7A7A7A', lineHeight: 1.65, fontSize: '0.9375rem' }}>{desc}</p>
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ step, icon, title, desc }: { step: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 240 }}>
      <div style={{
        width: 64, height: 64,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        color: '#CB6843',
      }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: '#CB6843', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Step {step}</div>
      <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{title}</h4>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, text, stars = 5 }: { name: string; role: string; text: string; stars?: number }) {
  return (
    <div style={{
      background: 'white',
      border: '1.5px solid #E2DFD4',
      borderRadius: 16,
      padding: '1.5rem',
      boxShadow: '3px 3px 0px rgba(42,74,62,0.08)',
    }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.875rem' }}>
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i} style={{ color: '#E8A838', fontSize: '0.875rem' }}>★</span>
        ))}
      </div>
      <p style={{ color: '#3D3D3D', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>"{text}"</p>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A1A1A' }}>{name}</div>
        <div style={{ fontSize: '0.8125rem', color: '#7A7A7A' }}>{role}</div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
interface LandingPageProps {
  user?: { name?: string | null; email?: string | null };
}

export default function LandingPage({ user }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#F3F1EA', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ═══════════════ NAV ═══════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(243,241,234,0.92)' : '#F3F1EA',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #E2DFD4' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img src="/images/hisabe logo.jpg" alt="Hisabe Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#1A1A1A', letterSpacing: '-0.02em' }}>Hisabe</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            {['Home', 'Services', 'About Us', 'Pricing'].map(l => (
              <a key={l} href="#" style={{ color: '#3D3D3D', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#2A4A3E')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#3D3D3D')}>
                {l}
              </a>
            ))}
          </div>

          {/* Links & CTA */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/login" style={{ color: '#3D3D3D', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>Login</Link>
            <Link href="/register" style={{ background: '#2A4A3E', color: 'white', padding: '0.625rem 1.5rem', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem', boxShadow: '0 4px 12px rgba(42,74,62,0.2)' }}>Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{ paddingTop: '8rem', paddingBottom: '5rem', maxWidth: 1200, margin: '0 auto', padding: '8rem 2rem 5rem', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
        {/* Left */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(42,74,62,0.1)', color: '#2A4A3E', padding: '0.375rem 1rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1.75rem' }}>
            ⭐ Award Winning Company
          </div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.1, fontWeight: 900, color: '#1A1A1A', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Focus on Growing<br />
            <span style={{ color: '#CB6843' }}>Your Business,</span><br />
            Not on <span style={{ color: '#2A4A3E' }}>Accounting</span>
          </h1>

          <p style={{ fontSize: '1.0625rem', color: '#7A7A7A', lineHeight: 1.7, maxWidth: 460, marginBottom: '2.5rem' }}>
            Reclaim your valuable time. Let our expert team handle the numbers so you can focus on what you do best — growing your business.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: '#2A4A3E', color: 'white', padding: '0.875rem 2rem', borderRadius: 10,
              fontWeight: 700, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 4px 14px rgba(42,74,62,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}>
              Get Started for Free
              <span style={{ fontSize: '1.1rem' }}>→</span>
            </Link>
            <a href="#features" style={{ border: '1.5px solid #D5D2C8', background: 'transparent', color: '#3D3D3D', padding: '0.875rem 1.75rem', borderRadius: 10, fontWeight: 600, textDecoration: 'none', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}>
              Learn More
            </a>
          </div>
        </div>

        {/* Right — Organic blob + screen-blended hero image + floating cards */}
        <div style={{ position: 'relative', height: 500 }}>

          {/* Decorative green blob — sits BEHIND the person */}
          <div style={{
            position: 'absolute',
            right: '5%',
            top: '52%',
            transform: 'translateY(-50%)',
            width: 300,
            height: 330,
            background: '#2A4A3E',
            borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
            zIndex: 0,
          }} />

          {/* Person image — stands freely in front of blob */}
          {/* mix-blend-mode: screen removes the solid black background */}
          <div style={{
            position: 'absolute',
            right: '-2%',
            bottom: 0,
            width: 420,
            height: 500,
            zIndex: 1,
          }}>
            <img
              src="/images/1man.jpg"
              alt="Professional Accountant"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                mixBlendMode: 'screen',
                display: 'block',
                filter: 'drop-shadow(0px 20px 40px rgba(42,74,62,0.4)) drop-shadow(0px 0px 60px rgba(203,104,67,0.15))',
                transform: 'scale(1.05)',
                transformOrigin: 'bottom center',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>

          {/* Floating card 1 — Total Assets */}
          <div style={{
            position: 'absolute', left: 0, top: '15%', zIndex: 3,
            background: 'white', borderRadius: 14, padding: '1.125rem 1.5rem',
            boxShadow: '6px 6px 0px rgba(42,74,62,0.12)', border: '1.5px solid #E2DFD4',
            minWidth: 180, animation: 'float 4s ease-in-out infinite',
          }}>
            <div style={{ fontSize: '0.75rem', color: '#7A7A7A', fontWeight: 600, marginBottom: '0.25rem' }}>Total Assets</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2A4A3E' }}>ETB 1,271,176</div>
            <div style={{ fontSize: '0.75rem', color: '#3D9970', fontWeight: 600, marginTop: '0.25rem' }}>▲ 12.5%</div>
          </div>

          {/* Floating card 2 — Net Book Value */}
          <div style={{
            position: 'absolute', right: -20, bottom: '10%', zIndex: 3,
            background: 'white', borderRadius: 14, padding: '1.125rem 1.5rem',
            boxShadow: '6px 6px 0px rgba(42,74,62,0.12)', border: '1.5px solid #E2DFD4',
            minWidth: 160, animation: 'float 5s 1s ease-in-out infinite',
          }}>
            <div style={{ fontSize: '0.75rem', color: '#7A7A7A', fontWeight: 600, marginBottom: '0.25rem' }}>Net Book Value</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#CB6843' }}>ETB 892,450</div>
          </div>

          {/* Mini bar chart SVG */}
          <div style={{ position: 'absolute', right: 40, top: '15%', zIndex: 2, background: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: '0.875rem', boxShadow: '4px 4px 0px rgba(42,74,62,0.1)' }}>
            <svg width="80" height="48" viewBox="0 0 80 48">
              {[10, 24, 18, 34, 28, 40].map((h, i) => (
                <rect key={i} x={i * 13} y={48 - h} width="9" height={h} rx="3" fill={i === 5 ? '#2A4A3E' : '#E2DFD4'} />
              ))}
            </svg>
          </div>

          {/* Sparkles */}
          <div style={{ position: 'absolute', top: '5%', left: '30%', zIndex: 1 }}><Sparkle /></div>
          <div style={{ position: 'absolute', bottom: '25%', left: '5%', zIndex: 1 }}><Sparkle color="#2A4A3E" size={18} /></div>
        </div>
      </section>

      {/* ═══════════════ TRUST BAR ═══════════════ */}
      <div style={{ borderTop: '1px solid #E2DFD4', borderBottom: '1px solid #E2DFD4', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3.5rem', opacity: 0.4 }}>
          {['Financial Pro', 'TaxEthio', 'BizAccounts', 'QuickBooks ET', 'FinanceCloud'].map(brand => (
            <span key={brand} style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#1A1A1A', letterSpacing: '-0.01em' }}>{brand}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════ PROBLEM SECTION ═══════════════ */}
      <section id="features" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div className="section-label">PROBLEM STATEMENT</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.75rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
              Tired of Juggling<br />
              <span style={{ color: '#CB6843' }}>Business Growth</span> and<br />
              Bookkeeping?
            </h2>
            <p style={{ color: '#7A7A7A', lineHeight: 1.75, fontSize: '1rem', marginBottom: '2rem' }}>
              Managing spreadsheets, calculating depreciation, filing VAT, and tracking inventory simultaneously leaves no room for running your actual business. Let us take that burden off your plate.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              {['Automated Asset Depreciation Schedules', 'Real-time VAT Compliance Tracking', 'Intelligent Inventory Valuation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 22, height: 22, background: '#2A4A3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ color: '#3D3D3D', fontWeight: 600, fontSize: '0.9375rem' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', position: 'relative', width: 'fit-content' }}>
              <WavyLine />
            </div>
          </div>

          {/* Right — Brown blob + screen-blended woman image + data card */}
          <div style={{ position: 'relative', height: 480 }}>

            {/* Brown organic blob */}
            <div style={{
              position: 'absolute', right: '0%', top: '50%', transform: 'translateY(-50%)',
              width: 320, height: 380,
              background: '#5C3A2D',
              borderRadius: '55% 45% 45% 55% / 40% 60% 40% 60%',
              zIndex: 0,
            }} />

            {/* Woman Image — black bg removed via mix-blend-mode: screen */}
            {/* Added drop-shadow for 3D pop effect */}
            <div style={{
              position: 'absolute', right: '0%', bottom: 0,
              width: 360, height: 460,
              zIndex: 1,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}>
              <img
                src="/images/2woman.jpg"
                alt="Business stress solution"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  mixBlendMode: 'screen',
                  filter: 'drop-shadow(0px 20px 40px rgba(92,58,45,0.4)) drop-shadow(0px 0px 50px rgba(203,104,67,0.2))',
                  transform: 'scale(1.05)',
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>

            {/* Financial Summary card — layered over image */}
            <div style={{
              position: 'absolute', left: 0, top: '10%',
              zIndex: 2,
              background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 16,
              padding: '1.5rem', boxShadow: '6px 6px 0px rgba(92,58,45,0.15)',
              minWidth: 240,
            }}>
              <div style={{ fontSize: '0.75rem', color: '#7A7A7A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Financial Summary</div>
              {[
                { label: 'Total Cost', value: 'ETB 1,271,176', color: '#2A4A3E' },
                { label: 'Accumulated Dep.', value: 'ETB 378,726', color: '#CB6843' },
                { label: 'Net Book Value', value: 'ETB 892,450', color: '#3D9970' },
                { label: 'VAT Due', value: 'ETB 143,890', color: '#1A1A1A' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #F3F1EA' }}>
                  <span style={{ color: '#7A7A7A', fontSize: '0.8125rem' }}>{row.label}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES GRID ═══════════════ */}
      <section style={{ padding: '4rem 2rem 6rem', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label" style={{ textAlign: 'center' }}>COMPANY AS THE GUIDE</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              At <span style={{ color: '#CB6843' }}>Hisabe,</span><br /> We Simplify Your <span style={{ color: '#2A4A3E' }}>Financials</span>
            </h2>
            <p style={{ color: '#7A7A7A', maxWidth: 520, margin: '0 auto', fontSize: '1rem' }}>Everything you need to maintain accurate books and stay compliant with Ethiopian tax regulations.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <FeatureCard icon={<Gem size={32} strokeWidth={1.5} />} title="Fixed Asset Management" desc="Automated depreciation schedules, net book value tracking, and asset lifecycle management." />
            <FeatureCard icon={<BarChart3 size={32} strokeWidth={1.5} />} title="VAT Declaration" desc="Streamlined VAT computation at the 15% standard rate with automatic output/input calculations." />
            <FeatureCard icon={<Package size={32} strokeWidth={1.5} />} title="Stock Inventory" desc="Real-time inventory valuation, stock level monitoring, and cost-of-goods tracking." />
            <FeatureCard icon={<Users size={32} strokeWidth={1.5} />} title="Multi-Role Access" desc="Super Admin, Tenant Admin, and Accountant roles so your whole team stays coordinated." />
            <FeatureCard icon={<Cloud size={32} strokeWidth={1.5} />} title="Cloud-Based" desc="Your financial data is securely stored and accessible from anywhere, at any time." />
            <FeatureCard icon={<Smartphone size={32} strokeWidth={1.5} />} title="Responsive Platform" desc="Seamless experience across desktop, tablet, and mobile devices." />
          </div>
        </div>
      </section>

      {/* ═══════════════ 3-STEP PROCESS (Dark Green) ═══════════════ */}
      <section style={{ background: '#2A4A3E', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ maxWidth: 500, marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#CB6843', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>PLAN AND HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
              Our Simple <span style={{ color: '#CB6843' }}>Three-Step</span><br /> Process to{' '}
              <span style={{ color: 'white' }}>Financial<br />Clarity</span>
            </h2>
          </div>

          {/* Wavy connector line */}
          <div style={{ marginBottom: '-20px', opacity: 0.5 }}>
            <ProcessLine />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem', position: 'relative', zIndex: 1 }}>
            <StepCard step={1} icon={<Handshake size={28} strokeWidth={1.5} />} title="Free Consultation and Custom Plan" desc="We assess your business needs and design a bookkeeping plan tailored specifically for you." />
            <StepCard step={2} icon={<Settings size={28} strokeWidth={1.5} />} title="Seamless Integration with Your Current Systems" desc="We connect with your existing tools and workflows with zero disruption to your operations." />
            <StepCard step={3} icon={<ClipboardList size={28} strokeWidth={1.5} />} title="Regular Reports and Financial Insights" desc="Receive clear monthly reports and actionable insights to guide your business decisions." />
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section style={{ padding: '6rem 2rem', background: '#FAF9F5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label" style={{ textAlign: 'center' }}>TESTIMONIALS</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Hear From <span style={{ color: '#CB6843' }}>Business Owners</span> Like You
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <TestimonialCard name="Abebe Tigistu" role="Butcher / Siga Bet Owner" text="Hisabe transformed how I track my inventory and assets. I finally have clarity on my business finances." />
            <TestimonialCard name="Tigist Haile" role="Restaurant Manager" text="VAT filing used to take me days. Now it takes minutes. The system is incredibly intuitive and accurate." />
            <TestimonialCard name="Dawit Samuel" role="Import / Export Business" text="The multi-tenant setup is perfect for my group of companies. Highly recommend for any growing business." />
            <TestimonialCard name="Fatuma Ahmed" role="Retail Store Owner" text="I always knew I needed proper bookkeeping but didn't know where to start. This platform made it simple." stars={5} />
            <TestimonialCard name="Yosef Bekele" role="Construction Firm Director" text="The fixed asset schedule feature alone saved my accountant 20 hours per month. Worth every birr." />
            <TestimonialCard name="Hanan Mohammed" role="Clinic Administrator" text="Compliance with Ethiopian tax regulations used to stress me out. Not anymore. Exceptional service." />
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: '#5C3A2D', borderRadius: 24, padding: '4rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '2rem', position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative blob inside banner */}
            <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, background: 'rgba(203,104,67,0.25)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', left: -40, bottom: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
              <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
                Join the Ranks of Successful<br />Entrepreneurs with Hisabe
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem' }}>Start your journey to stress-free bookkeeping today.</p>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Link href={user ? '/dashboard' : '/register'} style={{
                background: '#CB6843', color: 'white', padding: '1rem 2.25rem',
                borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)', display: 'inline-block',
              }}>
                {user ? 'Open Dashboard' : 'Create Free Account'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ background: '#1A2E27', padding: '3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <img src="/images/hisabe logo.jpg" alt="Hisabe Logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                <span style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>Hisabe</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>Professional accounting software designed for Ethiopian businesses.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
              {[
                { heading: 'Product', links: ['Features', 'Pricing', 'Dashboard', 'API'] },
                { heading: 'Support', links: ['Documentation', 'Contact', 'Status', 'Privacy'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Terms'] },
              ].map(col => (
                <div key={col.heading}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{col.heading}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {col.links.map(l => <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>{l}</a>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem' }}>© 2026 Hisabe. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map(l => <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8125rem' }}>{l}</a>)}
            </div>
          </div>
        </div>
      </footer>

      {/* Float animation keyframe */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
