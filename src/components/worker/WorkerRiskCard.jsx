import { Link } from 'react-router-dom';
import AppIcon from '../AppIcon';

const severityStyles = {
  HIGH: 'bg-[#fff0eb] text-[#ee641e]',
  MEDIUM: 'bg-[#fff7df] text-[#aa7518]',
  LOW: 'bg-[#edf3f6] text-[#5a6873]',
};

export default function WorkerRiskCard({ risk, priority = false }) {
  return (
    <Link
      to={`/worker/actions/${risk.id}`}
      className={`group flex min-h-[86px] items-center gap-3 rounded-[22px] px-5 py-4 transition-transform active:scale-[.985] ${priority ? 'bg-[#fff3ee]' : 'bg-white'}`}
      aria-label={`${risk.title}, ${risk.severity}, ${risk.status}`}
    >
      {priority && <span className="h-12 w-1.5 shrink-0 rounded-full bg-app-accent" aria-hidden="true" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[18px] font-extrabold tracking-[-.5px] text-[#14232e]">{risk.title}</span>
        <span className="mt-1 block truncate text-[14px] text-[#697680]">{risk.location}</span>
      </span>
      <span className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-extrabold ${severityStyles[risk.severity] || severityStyles.LOW}`}>
        {risk.severity}
      </span>
      {!priority && <span className="hidden shrink-0 text-[13px] text-[#5f6871] min-[370px]:inline">{risk.status}</span>}
      <AppIcon name="chevronRight" className="h-5 w-5 shrink-0 text-[#65717a] transition-transform group-hover:translate-x-0.5" strokeWidth={2.1} />
    </Link>
  );
}
