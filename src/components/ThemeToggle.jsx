import AppIcon from './AppIcon';

const THEME_OPTIONS = [
  { value: 'light', icon: 'sun', label: '라이트' },
  { value: 'dark', icon: 'moon', label: '다크' },
];

export default function ThemeToggle({ theme, onChange, compact = false, className = '' }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-app-border bg-app-panel-subtle p-1 shadow-sm ${compact ? 'gap-1' : 'gap-3'} ${className}`}
      role="group"
      aria-label="화면 테마"
    >
      {THEME_OPTIONS.map(option => {
        const selected = theme === option.value;

        return (
          <button
            key={option.value}
            className={`flex h-8 items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold transition-colors ${compact ? 'w-8' : 'flex-1 px-2'} ${selected ? 'bg-app-control text-app-accent shadow-sm' : 'text-app-muted hover:bg-app-hover hover:text-app-text'}`}
            type="button"
            aria-pressed={selected}
            aria-label={`${option.label} 모드로 전환`}
            title={`${option.label} 모드`}
            onClick={() => onChange(option.value)}
          >
            <AppIcon name={option.icon} className="h-4 w-4" />
            {!compact && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
