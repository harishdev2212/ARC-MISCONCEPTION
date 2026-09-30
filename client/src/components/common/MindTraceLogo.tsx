import React from 'react';

export type LogoVariant = 'full' | 'compact' | 'monochrome';
export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoTheme = 'light' | 'dark';

export interface MindTraceLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  clickable?: boolean;
  withContainer?: boolean;
}

/**
 * Pure Vector Neural "M" Brain Symbol
 */
export const MindTraceSymbol: React.FC<{
  size?: number;
  theme?: LogoTheme;
  monochrome?: boolean;
  withContainer?: boolean;
}> = ({
  size = 36,
  theme = 'light',
  monochrome = false,
  withContainer = true
}) => {
  const symbolId = React.useId();

  if (withContainer) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`mt-grad-${symbolId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {monochrome ? (
              <>
                <stop offset="0%" stopColor={theme === 'dark' ? '#FFFFFF' : '#0F172A'} />
                <stop offset="100%" stopColor={theme === 'dark' ? '#CBD5E1' : '#334155'} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </>
            )}
          </linearGradient>
          <linearGradient id={`mt-node-${symbolId}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>

        {/* Rounded Modern Shield Background */}
        <rect width="48" height="48" rx="13" fill={`url(#mt-grad-${symbolId})`} />

        {/* Neural Brain "M" Lobes */}
        {/* Left Cerebral Hemisphere */}
        <path
          d="M12 36V22C12 15.6 16.2 11.5 21.5 11.5C23 11.5 24 12.5 24 14V27C24 29 22.4 30.5 20.5 30.5C18.8 30.5 17.5 29.3 17.5 27.5V22"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Cerebral Hemisphere */}
        <path
          d="M36 36V22C36 15.6 31.8 11.5 26.5 11.5C25 11.5 24 12.5 24 14V27C24 29 25.6 30.5 27.5 30.5C29.2 30.5 30.5 29.3 30.5 27.5V22"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Synaptic Cognitive Nodes */}
        <circle cx="24" cy="13.5" r="2.2" fill={monochrome ? '#FFFFFF' : `url(#mt-node-${symbolId})`} />
        <circle cx="12" cy="36" r="2" fill="#FFFFFF" />
        <circle cx="36" cy="36" r="2" fill="#FFFFFF" />
        <circle cx="17.5" cy="22" r="1.6" fill={monochrome ? '#FFFFFF' : '#38BDF8'} />
        <circle cx="30.5" cy="22" r="1.6" fill={monochrome ? '#FFFFFF' : '#38BDF8'} />
        <circle cx="24" cy="27" r="1.6" fill={monochrome ? '#FFFFFF' : '#C084FC'} />
      </svg>
    );
  }

  // Transparent background symbol
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`mt-stroke-${symbolId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path
        d="M10 38V20C10 13 15 8 22 8C23.8 8 24 9.5 24 11V28C24 30.5 22 32.5 19.5 32.5C17.5 32.5 16 31 16 29V21"
        stroke={`url(#mt-stroke-${symbolId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 38V20C38 13 33 8 26 8C24.2 8 24 9.5 24 11V28C24 30.5 26 32.5 28.5 32.5C30.5 32.5 32 31 32 29V21"
        stroke={`url(#mt-stroke-${symbolId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="10" r="2.8" fill="#38BDF8" />
      <circle cx="10" cy="38" r="2.5" fill="#2563EB" />
      <circle cx="38" cy="38" r="2.5" fill="#7C3AED" />
    </svg>
  );
};

/**
 * Commercial MindTrace AI Logo Component
 * Meets all guidelines:
 * - variant: 'full' | 'compact' | 'monochrome'
 * - size: 'sm' | 'md' | 'lg'
 * - theme: 'light' | 'dark'
 */
export const MindTraceLogo: React.FC<MindTraceLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'light',
  subtitle,
  className = '',
  style,
  onClick,
  clickable = false,
  withContainer = true
}) => {
  // Sizing tokens
  const symbolDimensions: Record<LogoSize, number> = {
    sm: 28,
    md: 36,
    lg: 44
  };

  const textStyles: Record<LogoSize, { fontSize: string; gap: string; tagFont: string; tagPad: string }> = {
    sm: { fontSize: '15px', gap: '8px', tagFont: '9px', tagPad: '1px 5px' },
    md: { fontSize: '18px', gap: '10px', tagFont: '10px', tagPad: '2px 7px' },
    lg: { fontSize: '22px', gap: '12px', tagFont: '11px', tagPad: '2.5px 8px' }
  };

  const dim = symbolDimensions[size] || 36;
  const currentText = textStyles[size] || textStyles.md;

  const isClickable = Boolean(onClick || clickable);
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0F172A';

  // Subtitle / badge styling
  const badgeStyles = theme === 'dark'
    ? {
        color: '#C4B5FD',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }
    : {
        color: '#2563EB',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE'
      };

  return (
    <div
      role={isClickable ? 'button' : 'img'}
      aria-label="MindTrace AI"
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      className={`mindtrace-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentText.gap,
        cursor: isClickable ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
        transition: 'opacity 0.15s ease',
        ...style
      }}
    >
      {/* 1. Neural Brain "M" Symbol */}
      <MindTraceSymbol
        size={dim}
        theme={theme}
        monochrome={variant === 'monochrome'}
        withContainer={withContainer}
      />

      {/* 2. Full Wordmark & Subtitle Tag */}
      {variant !== 'compact' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: currentText.fontSize,
              fontWeight: 800,
              color: textColor,
              letterSpacing: '-0.03em',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
            }}
          >
            MindTrace
          </span>

          {subtitle && (
            <span
              style={{
                fontSize: currentText.tagFont,
                fontWeight: 700,
                letterSpacing: '0.04em',
                borderRadius: '6px',
                padding: currentText.tagPad,
                textTransform: 'uppercase',
                lineHeight: 1.2,
                ...badgeStyles
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
