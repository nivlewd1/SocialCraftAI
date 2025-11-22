import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

// =====================================================
// WatermarkOverlay Component
// =====================================================
// CSS-based watermark for Free tier users
// - Zero compute cost (pure CSS)
// - Prevents clean screenshots
// - Shows upgrade CTA
// =====================================================

interface WatermarkOverlayProps {
  children: React.ReactNode;
  type?: 'image' | 'content';
  className?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  children,
  type = 'image',
  className = '',
}) => {
  const { subscription } = useSubscription();

  // Only show watermark for free tier users
  const showWatermark = subscription?.hasWatermark ?? true;

  if (!showWatermark) {
    return <>{children}</>;
  }

  return (
    <div className={`watermark-container ${className}`}>
      {children}

      {/* Watermark overlay */}
      <div className="watermark-overlay">
        {/* Diagonal repeating pattern */}
        <div className="watermark-pattern">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="watermark-text">
              SocialCraft AI
            </span>
          ))}
        </div>

        {/* Center upgrade CTA */}
        <div className="watermark-cta">
          <span className="watermark-cta-text">
            Upgrade to remove watermark
          </span>
        </div>
      </div>

      <style>{`
        .watermark-container {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }

        .watermark-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          overflow: hidden;
        }

        .watermark-pattern {
          position: absolute;
          inset: -50%;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 40px;
          transform: rotate(-30deg);
          opacity: 0.15;
        }

        .watermark-text {
          font-size: 24px;
          font-weight: 700;
          color: white;
          text-shadow:
            2px 2px 4px rgba(0, 0, 0, 0.8),
            -2px -2px 4px rgba(0, 0, 0, 0.8);
          white-space: nowrap;
          user-select: none;
          -webkit-user-select: none;
        }

        .watermark-cta {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(59, 130, 246, 0.95));
          padding: 8px 16px;
          border-radius: 20px;
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .watermark-cta:hover {
          transform: translateX(-50%) scale(1.05);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        .watermark-cta-text {
          color: white;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          user-select: none;
        }

        /* Additional protection against screenshots */
        .watermark-container img,
        .watermark-container video {
          -webkit-user-drag: none;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Subtle grid pattern for extra protection */
        .watermark-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.03) 50%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.03) 50%, transparent 52%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

// =====================================================
// CreditBadge Component
// =====================================================
// Shows credit cost before generation
// =====================================================

interface CreditBadgeProps {
  type: 'text' | 'image' | 'video';
  className?: string;
}

export const CreditBadge: React.FC<CreditBadgeProps> = ({ type, className = '' }) => {
  const creditCosts = { text: 1, image: 15, video: 150 };
  const cost = creditCosts[type];

  const colors = {
    text: 'bg-green-500/20 text-green-400 border-green-500/30',
    image: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    video: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[type]} ${className}`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472a4.265 4.265 0 01.264-.521z" />
      </svg>
      {cost} {cost === 1 ? 'credit' : 'credits'}
    </span>
  );
};

// =====================================================
// CreditBalance Component
// =====================================================
// Shows current credit balance in header/nav
// =====================================================

interface CreditBalanceProps {
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({
  compact = false,
  className = '',
  onClick,
}) => {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-700 rounded-full h-6 w-16 ${className}`} />
    );
  }

  if (!subscription) {
    return null;
  }

  const totalCredits = subscription.totalCredits;
  const percentage = Math.min(100, (totalCredits / subscription.monthlyCreditsLimit) * 100);

  // Color based on remaining credits
  const getColor = () => {
    if (percentage > 50) return 'text-green-400';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-colors ${className}`}
      >
        <svg className={`w-4 h-4 ${getColor()}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472a4.265 4.265 0 01.264-.521z" />
        </svg>
        <span className={`text-sm font-medium ${getColor()}`}>
          {totalCredits.toLocaleString()}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">Credits</span>
        <span className={`text-lg font-bold ${getColor()}`}>
          {totalCredits.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            percentage > 50
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : percentage > 20
              ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
              : 'bg-gradient-to-r from-red-500 to-rose-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Monthly: {subscription.subscriptionCredits}</span>
        <span>Purchased: {subscription.purchasedCredits}</span>
      </div>
    </div>
  );
};

export default WatermarkOverlay;
