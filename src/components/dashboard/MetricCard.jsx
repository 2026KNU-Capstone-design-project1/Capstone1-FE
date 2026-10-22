import AppIcon from '../AppIcon';

const tones = {
  neutral: 'text-app-text',
  danger: 'text-[#ff5146]',
};

export default function MetricCard({ metric }) {
  const tone = tones[metric.tone];

  return (
    <article className="flex h-[96px] items-center justify-between gap-4 rounded-xl border border-app-border bg-app-panel-subtle px-7">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium text-app-text-soft">{metric.label}</p>
        <p className={`mt-1.5 text-[31px] leading-none font-bold tracking-[.4px] ${tone}`}>
          {metric.value}
          {metric.suffix && <span className="ml-1 text-[17px]">{metric.suffix}</span>}
        </p>
      </div>
      <AppIcon
        name={metric.icon}
        className="h-8 w-8 shrink-0 text-[#8fa4b4]"
        strokeWidth={metric.icon === 'flame' ? 1.3 : 1.7}
      />
    </article>
  );
}
