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
      className={`group flex items-center gap-3 rounded-[19px] border border-[#e1e6e9] bg-white pr-[21px] shadow-[0_5px_16px_rgba(35,54,68,0.025)] transition-transform active:scale-[.985] ${priority ? 'h-[84px] pl-[29px]' : 'h-[80px] pl-[21px]'}`}
      aria-label={[risk.title, risk.severity, risk.status].filter(Boolean).join(', ')}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[19px] leading-6 font-extrabold tracking-[-.6px] text-[#14232e]">{risk.title}</span>
        <span className="mt-[3px] block truncate text-[15px] leading-5 text-[#697680]">{risk.location}</span>
      </span>
      <span className={`min-w-[58px] shrink-0 rounded-[15px] px-[11px] py-[7px] text-center text-[12px] leading-4 font-extrabold ${severityStyles[risk.severity] || severityStyles.LOW}`}>
        {risk.severity}
      </span>
      <AppIcon name="chevronRight" className="h-5 w-5 shrink-0 text-[#65717a] transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
    </Link>
  );
}
