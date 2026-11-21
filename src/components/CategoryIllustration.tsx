import type { DonationCategory } from '../lib/types';

const THEME: Record<DonationCategory, { bg: string; fg: string }> = {
  'Cooked meals': { bg: '#fde9da', fg: '#f28b44' },
  'Rice and grains': { bg: '#f6efd9', fg: '#c9a227' },
  'Bread and bakery': { bg: '#f5e4cf', fg: '#8a5a2b' },
  'Fruits and vegetables': { bg: '#e2f1e6', fg: '#2f7d5b' },
  'Packaged food': { bg: '#e3f0fb', fg: '#2b6cb0' },
  Other: { bg: '#eeeae4', fg: '#6b7a72' },
};

/** Inline SVG illustration per food category. */
export function CategoryIllustration({ category }: { category: DonationCategory }) {
  const { bg, fg } = THEME[category];
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" role="img" aria-label={category} preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="120" fill={bg} />
      {category === 'Cooked meals' && (
        <g>
          <path d="M60 60 H140 A40 32 0 0 1 60 60 Z" fill={fg} />
          <rect x="54" y="58" width="92" height="8" rx="4" fill="#164e3b" opacity="0.8" />
          <path d="M85 40 q-6 -10 0 -18 M105 40 q-6 -10 0 -18 M125 40 q-6 -10 0 -18" stroke={fg} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
      {category === 'Rice and grains' && (
        <g>
          <path d="M60 60 H140 A40 30 0 0 1 60 60 Z" fill="#fffaf0" stroke={fg} strokeWidth="4" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <ellipse key={i} cx={75 + i * 10} cy={50 - (i % 2) * 6} rx="5" ry="2.5" fill={fg} />
          ))}
        </g>
      )}
      {category === 'Bread and bakery' && (
        <g>
          <ellipse cx="100" cy="66" rx="58" ry="32" fill={fg} />
          <path d="M70 48 q8 -6 14 0 M96 44 q8 -6 14 0 M122 48 q8 -6 14 0" stroke="#fff3e0" strokeWidth="3" fill="none" />
        </g>
      )}
      {category === 'Fruits and vegetables' && (
        <g>
          <circle cx="82" cy="66" r="24" fill="#d9534f" />
          <circle cx="122" cy="62" r="20" fill={fg} />
          <path d="M82 40 q4 -10 12 -12" stroke="#5b3a1a" strokeWidth="3" fill="none" />
          <ellipse cx="96" cy="36" rx="10" ry="5" fill={fg} />
        </g>
      )}
      {category === 'Packaged food' && (
        <g>
          <rect x="60" y="40" width="80" height="54" rx="6" fill={fg} />
          <rect x="60" y="56" width="80" height="8" fill="#ffffff" opacity="0.7" />
          <rect x="88" y="30" width="24" height="12" rx="3" fill="#164e3b" />
        </g>
      )}
      {category === 'Other' && (
        <g>
          <circle cx="100" cy="62" r="34" fill="#ffffff" stroke={fg} strokeWidth="4" />
          <circle cx="100" cy="62" r="20" fill={fg} opacity="0.4" />
        </g>
      )}
    </svg>
  );
}
