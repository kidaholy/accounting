"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              A
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>AccountPro</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Features
            </Link>
            <Link href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Pricing
            </Link>
            <Link href="/login">
              <button className="btn btn-primary">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        paddingTop: '120px', 
        paddingBottom: '80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            color: 'var(--accent-color)',
            marginBottom: '2rem'
          }}>
            🚀 New: Multi-tenant SaaS Platform
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Modern Accounting for<br />Modern Businesses
          </h1>

          <p style={{ 
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.6'
          }}>
            Streamline your financial operations with our cloud-based accounting solution. 
            Fixed assets, VAT compliance, and inventory management—all in one place.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
            <Link href="/login">
              <button className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                Start Free Trial
              </button>
            </Link>
            <button className="btn" style={{ 
              padding: '0.875rem 2rem', 
              fontSize: '1rem',
              background: 'transparent',
              border: '1px solid var(--border-color)'
            }}>
              View Demo
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="glass-panel" style={{ 
            padding: '2rem',
            maxWidth: '1000px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1rem',
              gap: '0.5rem'
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Assets</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent-color)' }}>ETB 1,271,176</div>
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>VAT Payable</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--success)' }}>ETB 7,123,456</div>
              </div>
              <div style={{ 
                background: 'rgba(139, 92, 246, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Inventory Value</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#8b5cf6' }}>ETB 892,450</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything You Need</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive accounting tools designed for Ethiopian businesses
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <FeatureCard 
              icon="📊"
              title="Fixed Asset Management"
              description="Track depreciation, additions, and net book value with automated calculations."
            />
            <FeatureCard 
              icon="🧾"
              title="VAT Declaration"
              description="Simplify tax compliance with automatic VAT calculations and reporting."
            />
            <FeatureCard 
              icon="📦"
              title="Inventory Tracking"
              description="Real-time stock management with valuation and cost tracking."
            />
            <FeatureCard 
              icon="👥"
              title="Multi-User Access"
              description="Role-based permissions for your team with super admin, admin, and accountant roles."
            />
            <FeatureCard 
              icon="☁️"
              title="Cloud Based"
              description="Access your data anywhere, anytime with secure cloud storage."
            />
            <FeatureCard 
              icon="📱"
              title="Responsive Design"
              description="Works seamlessly on desktop, tablet, and mobile devices."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Simple Pricing</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Choose the plan that fits your business needs
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <PricingCard 
              name="Free"
              price="0"
              description="Perfect for small businesses getting started"
              features={['1 User', '10 Assets', '50 Inventory Items', 'Basic VAT']}
            />
            <PricingCard 
              name="Basic"
              price="29"
              description="For growing businesses with more needs"
              features={['3 Users', '100 Assets', '500 Inventory Items', 'Full VAT', 'Email Support']}
              popular
            />
            <PricingCard 
              name="Professional"
              price="79"
              description="For established businesses"
              features={['10 Users', '1000 Assets', '5000 Inventory Items', 'Advanced Reports', 'Priority Support']}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 2rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Get Started?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Join thousands of businesses using AccountPro for their accounting needs.
          </p>
          <Link href="/login">
            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
              Start Your Free Trial
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '3rem 2rem', 
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <p>© 2024 AccountPro. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  description, 
  features, 
  popular 
}: { 
  name: string; 
  price: string; 
  description: string; 
  features: string[];
  popular?: boolean;
}) {
  return (
    <div className="glass-panel" style={{ 
      padding: '2rem',
      position: 'relative',
      border: popular ? '2px solid var(--accent-color)' : undefined
    }}>
      {popular && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent-color)',
          color: 'white',
          padding: '0.25rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          Most Popular
        </div>
      )}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{name}</h3>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '3rem', fontWeight: '700' }}>${price}</span>
        <span style={{ color: 'var(--text-secondary)' }}>/month</span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{description}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
        {features.map((feature, i) => (
          <li key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--success)' }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/login" style={{ display: 'block' }}>
        <button className="btn" style={{ 
          width: '100%',
          background: popular ? 'var(--accent-color)' : 'transparent',
          border: popular ? 'none' : '1px solid var(--border-color)'
        }}>
          Get Started
        </button>
      </Link>
    </div>
  );
}
