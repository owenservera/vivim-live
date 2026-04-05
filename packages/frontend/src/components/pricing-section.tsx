/**
 * Pricing Section
 *
 * Four-tier pricing: FreeCore, Cloud Pro, Teams, Enterprise
 * Design inspired by vivim-php and visual projects
 */

'use client';

import { useRef, useEffect, useState } from 'react';

interface PricingTier {
  id: string;
  name: string;
  badge: string;
  badgeStyle?: React.CSSProperties;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaStyle: 'primary' | 'ghost';
  featured?: boolean;
}

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const tiers: PricingTier[] = [
    {
      id: 'freecore',
      name: 'Free',
      badge: 'Open Core',
      price: '$0',
      period: 'unlimited',
      description: 'Full intelligence. No limits. Self-host forever.',
      features: [
        'Full 8-layer context engine',
        '9 memory types',
        '10+ provider parsers',
        'Zero-knowledge encryption',
        'MCP server',
        'P2P network',
        '13 detection algorithms',
        'DID identity',
        'TDASS co-governance',
        'Unlimited self-hosted',
      ],
      cta: 'GitHub',
      ctaStyle: 'primary',
    },
    {
      id: 'cloud-pro',
      name: 'Cloud Pro',
      badge: 'Most Popular',
      badgeStyle: { background: 'var(--teal)', color: 'var(--void)' },
      price: '$9',
      period: '/month',
      description: 'Managed cloud. Multi-device. Priority support.',
      features: [
        'Everything in FreeCore',
        'Managed cloud hosting',
        '10 GB encrypted storage',
        'Real-time sync',
        'Multi-device access',
        'Mobile app',
        'Priority support',
        'Automatic backups',
        'Usage analytics',
      ],
      cta: 'Get Started',
      ctaStyle: 'primary',
      featured: true,
    },
    {
      id: 'teams',
      name: 'Teams',
      badge: 'Teams',
      badgeStyle: { background: 'var(--gold-dim)', color: 'var(--gold)' },
      price: '$25',
      period: '/seat/month',
      description: 'Shared memory. Co-governance. Team admin.',
      features: [
        'Everything in Cloud Pro',
        'Team admin dashboard',
        'Shared memory pools',
        'TDASS co-governance',
        'SSO integration',
        'Audit logs',
        '5-seat minimum',
        'Role-based access',
        'Team activity feed',
      ],
      cta: 'Contact Sales',
      ctaStyle: 'ghost',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      badge: 'Enterprise',
      badgeStyle: { background: 'var(--purple-dim)', color: 'var(--purple)' },
      price: 'Custom',
      period: '',
      description: 'Dedicated infrastructure. Compliance guaranteed.',
      features: [
        'Everything in Teams',
        'Dedicated infrastructure',
        'SOC 2 / HIPAA / FedRAMP',
        '99.9% SLA guarantee',
        'On-premise option',
        'Legal hold & eDiscovery',
        'Custom integrations',
        'Dedicated support engineer',
        'Custom training',
      ],
      cta: 'Contact Sales',
      ctaStyle: 'ghost',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="pricing"
      aria-label="Pricing"
    >
      <div className="pricing__container">
        <div className={`pricing__header ${isVisible ? 'animate' : ''}`}>
          <h2 className="pricing__title">
            Free intelligence. Paid convenience.
          </h2>
          <p className="pricing__subtitle">
            The free tier is genuinely complete. Pay only for managed convenience.
          </p>
        </div>

        <div className={`pricing__grid ${isVisible ? 'animate' : ''}`}>
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              delay={index * 100}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  tier,
  delay,
  isVisible,
}: {
  tier: PricingTier;
  delay: number;
  isVisible: boolean;
}) {
  return (
    <div
      className={`pricing-card ${tier.featured ? 'pricing-card--featured' : ''} ${
        tier.id === 'enterprise' ? 'pricing-card--enterprise' : ''
      } ${isVisible ? 'animate' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="pricing-card__head">
        <span
          className="pricing-card__badge"
          style={tier.badgeStyle}
        >
          {tier.badge}
        </span>
        <h3 className="pricing-card__name">{tier.name}</h3>
        <div className="pricing-card__price">
          <span className="mono">{tier.price}</span>
          {tier.period && <span className="pricing-card__period">{tier.period}</span>}
        </div>
      </div>

      <p className="pricing-card__desc">{tier.description}</p>

      <ul className="pricing-card__features">
        {tier.features.map((feature) => (
          <li key={feature}>
            <svg className="pricing-card__check" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7.5L5.5 11L12 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={tier.id === 'freecore' ? 'https://github.com/vivim' : '#waitlist'}
        className={`btn btn--${tier.ctaStyle} pricing-card__btn magnetic`}
        target={tier.id === 'freecore' ? '_blank' : undefined}
        rel={tier.id === 'freecore' ? 'noopener noreferrer' : undefined}
      >
        {tier.cta}
      </a>
    </div>
  );
}
