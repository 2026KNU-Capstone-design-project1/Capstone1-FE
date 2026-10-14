import { Link } from 'react-router-dom';

const variants = {
  compact: {
    wrapper: 'gap-3',
    mark: 'h-8 w-8',
    name: 'text-[18px] tracking-[-.4px]',
    tagline: 'mt-1 text-[9px] tracking-[.45px]',
  },
  auth: {
    wrapper: 'gap-4',
    mark: 'h-12 w-12',
    name: 'text-[29px] tracking-[-1px]',
    tagline: 'mt-1.5 text-[14px] tracking-[.6px]',
  },
};

export default function BrandLogo({ to = '/', variant = 'auth' }) {
  const style = variants[variant];

  return (
    <Link
      to={to}
      className={`flex items-center ${style.wrapper}`}
      aria-label="VIRNECT Industrial Safety"
    >
      <svg
        className={`${style.mark} shrink-0 text-app-accent`}
        viewBox="0 0 48 48"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 1h32l-6 9H14ZM1 11h13l10 19 10-19h13L29 47H19Z" />
      </svg>
      <div>
        <div className={`${style.name} leading-none font-extrabold text-app-text`}>VIRNECT</div>
        <div className={`${style.tagline} ${variant === 'auth' ? 'text-auth-muted' : 'text-app-muted'}`}>INDUSTRIAL SAFETY</div>
      </div>
    </Link>
  );
}
