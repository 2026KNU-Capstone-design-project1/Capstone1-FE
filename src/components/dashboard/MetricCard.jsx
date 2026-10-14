import AppIcon from '../AppIcon';

const tones = {
  red: { icon: 'bg-[#3a242a] text-[#ff5146]', value: 'text-[#ff4c43]' },
  blue: { icon: 'bg-[#063c53] text-[#00b8e8]', value: 'text-[#10b7dd]' },
  green: { icon: 'bg-[#1c3325] text-[#20df5b]', value: 'text-[#24db59]' },
};

export default function MetricCard({ metric }) {
  const tone = tones[metric.tone];

  return (
    <article className="flex h-[96px] items-center rounded-xl border border-app-border bg-app-panel-subtle px-7">
      <div className={`grid h-[60px] w-[62px] shrink-0 place-items-center rounded-xl ${tone.icon}`}>
        <AppIcon name={metric.icon} className="h-8 w-8" strokeWidth={metric.icon === 'flame' ? 1.3 : 1.7} />
      </div>
      <div className="ml-5 min-w-0">
        <p className="truncate text-[14px] font-medium text-app-text">{metric.label}</p>
        <p className={`mt-1 text-[31px] leading-none font-bold tracking-[.4px] ${tone.value}`}>
          {metric.value}
          {metric.suffix && <span className="ml-1 text-[17px]">{metric.suffix}</span>}
        </p>
      </div>
    </article>
  );
}
