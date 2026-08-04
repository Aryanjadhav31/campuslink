import React from 'react';
import { Link } from 'react-router-dom';

export const LogoIcon = ({ className = '', iconClassName = '' }) => (
  <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold shadow-md transition-all ${className}`}>
    <svg
      className={iconClassName}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  </div>
);

const Logo = ({
  size = 'normal',
  showLink = true,
  layout = 'horizontal',
  subtitle = null,
  className = ''
}) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const isStacked = layout === 'stacked' || layout === 'vertical';

  const iconSizes = isLarge
    ? 'w-[52px] h-[52px] md:w-[64px] md:h-[64px]'
    : isSmall
    ? 'w-8 h-8'
    : 'w-9 h-9';

  const svgSizes = isLarge
    ? 'w-6 h-6 md:w-8 md:h-8'
    : isSmall
    ? 'w-4 h-4'
    : 'w-5 h-5';

  const textSizes = isLarge
    ? 'text-[28px] md:text-[32px]'
    : isSmall
    ? 'text-lg'
    : 'text-xl';

  const content = (
    <div className={`inline-flex ${isStacked ? 'flex-col items-center text-center' : 'items-center gap-2.5'} ${className}`}>
      {/* Brand Icon Badge */}
      <LogoIcon
        className={`${iconSizes} ${isStacked ? 'mb-4' : ''}`}
        iconClassName={svgSizes}
      />

      {/* Brand Text */}
      <div className={`flex items-center tracking-tight font-bold font-sans ${textSizes} ${isStacked && subtitle ? 'mb-[10px]' : isStacked ? 'mb-8' : ''}`}>
        <span className="text-white">
          Campus
        </span>
        <span className="text-[#0095F6]">
          Link
        </span>
      </div>

      {/* Optional Subtitle */}
      {isStacked && subtitle && (
        <p className="text-sm md:text-base text-gray-400 dark:text-zinc-400 font-normal mb-8">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link to="/" className="inline-block focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0095F6] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;


