/**
 * Pricing Section - Fully i18n-aware
 * Uses next-intl translations for all content
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { useTypedTranslations } from '@/i18n/useTypedTranslations';

interface PricingTier {
  id: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaStyle: 'primary' | 'ghost';
  featured?: boolean;
}

export function PricingSection() {
  const t = useTypedTranslations('pricing');
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
      name: t('tiers.freecore.name'),
      badge: t('tiers.freecore.badge'),
      price: t('tiers.freecore.price'),
      period: t('tiers.freecore.period'),
      description: t('tiers.freecore.description'),
      features: (t.raw('tiers.freecore.features') as string[]) || [],
      cta: t('tiers.freecore.cta'),
      ctaStyle: 'primary',
    },
    {
      id: 'cloudPro',
      name: t('tiers.cloudPro.name'),
      badge: t('tiers.cloudPro.badge'),
      price: t('tiers.cloudPro.price'),
      period: t('tiers.cloudPro.period'),
      description: t('tiers.cloudPro.description'),
      features: (t.raw('tiers.cloudPro.features') as string[]) || [],
      cta: t('tiers.cloudPro.cta'),
      ctaStyle: 'primary',
      featured: true,
    },
    {
      id: 'teams',
      name: t('tiers.teams.name'),
      badge: t('tiers.teams.badge'),
      price: t('tiers.teams.price'),
      period: t('tiers.teams.period'),
      description: t('tiers.teams.description'),
      features: (t.raw('tiers.teams.features') as string[]) || [],
      cta: t('tiers.teams.cta'),
      ctaStyle: 'ghost',
    },
    {
      id: 'enterprise',
      name: t('tiers.enterprise.name'),
      badge: t('tiers.enterprise.badge'),
      price: t('tiers.enterprise.price'),
      period: t('tiers.enterprise.period'),
      description: t('tiers.enterprise.description'),
      features: (t.raw('tiers.enterprise.features') as string[]) || [],
      cta: t('tiers.enterprise.cta'),
      ctaStyle: 'ghost',
    },
  ];

  const badgeStyles: Record<string, React.CSSProperties> = {
    freecore: { background: 'rgba(255,255,255,0.05)', color: 'var(--muted-foreground)' },
    cloudPro: { background: 'var(--teal)', color: 'var(--void)' },
    teams: { background: 'var(--gold-dim)', color: 'var(--gold)' },
    enterprise: { background: 'var(--purple-dim)', color: 'var(--purple)' },
  };

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="pricing"
      aria-label={t('sectionBadge')}
    >
      <div className="pricing__container">
        <div className={`pricing__header ${isVisible ? 'animate' : ''}`}>
          <h2 className="pricing__title">
            {t('title')}
          </h2>
          <p className="pricing__subtitle">
            {t('subtitle')}
          </p>
        </div>

        <div className={`pricing__grid ${isVisible ? 'animate' : ''}`}>
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`pricing-card ${tier.featured ? 'pricing-card--featured' : ''} ${
                tier.id === 'enterprise' ? 'pricing-card--enterprise' : ''
              } ${isVisible ? 'animate' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="pricing-card__head">
                <span
                  className="pricing-card__badge"
                  style={badgeStyles[tier.id]}
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
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <a
                href={tier.id === 'freecore' ? 'https://github.com/vivim' : '#waitlist'}
                className={`pricing-card__btn btn--${tier.ctaStyle}`}
                target={tier.id === 'freecore' ? '_blank' : undefined}
                rel={tier.id === 'freecore' ? 'noopener noreferrer' : undefined}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
