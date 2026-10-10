import factoryBgImg from './assets/factory-transparent-bg2.png';

const ICON_PATHS = {
  user: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="12" rx="1" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3M12 15v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <path d="m3 3 18 18M10.6 5.1A12 12 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.1 6.1A19 19 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
};

export function Icon({ name, className = '' }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export function FactoryIllustration() {
  return (
    <div
      className="factory-illustration absolute bottom-0 left-0 -z-10 hidden min-[1600px]:block"
      style={{
        backgroundImage: `url(${factoryBgImg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'bottom center',
        height: '65%',
        width: '115%',
      }}
      role="img"
      aria-label="배경 투명화 산업 공장 일러스트"
    />
  );
}
