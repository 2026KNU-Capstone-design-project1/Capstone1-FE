import { Link } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import WorkerRiskCard from './components/worker/WorkerRiskCard';
import { workerMock } from './data/workerMock';

export default function WorkerHomePage() {
  const priorityRisk = workerMock.risks.find(risk => risk.id === workerMock.priorityActionId);
  const assignedRisks = workerMock.risks.filter(risk => risk.id !== workerMock.priorityActionId && risk.status !== '완료').slice(0, 2);

  return (
    <div>
      <section aria-labelledby="worker-summary-title">
        <h1 id="worker-summary-title" className="ml-[5px] text-[28px] leading-9 font-black tracking-[-1.15px]">내 담당 조치</h1>
        <div className="mt-[15px] grid h-[115px] grid-cols-3 items-center rounded-[22px] bg-white px-2 shadow-[0_8px_30px_rgba(35,54,68,0.025)]">
          {workerMock.summary.map((item, index) => (
            <div key={item.id} className={`flex h-[62px] flex-col items-center justify-center text-center ${index > 0 ? 'border-l border-[#e1e6e9]' : ''}`}>
              <p className="text-[16px] leading-5 font-bold text-[#59636c]">{item.label}</p>
              <p className={`mt-[9px] text-[31px] leading-[30px] font-black ${item.tone === 'accent' ? 'text-[#ff6811]' : 'text-[#0d1b25]'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[31px]" aria-labelledby="priority-action-title">
        <h2 id="priority-action-title" className="mb-[12px] ml-[5px] text-[24px] leading-[34px] font-black tracking-[-.8px]">우선 조치</h2>
        <WorkerRiskCard risk={priorityRisk} priority />
      </section>

      <section className="mt-[32px]" aria-labelledby="assigned-risk-title">
        <div className="mb-[11px] flex h-[34px] items-center justify-between">
          <h2 id="assigned-risk-title" className="ml-[5px] text-[24px] leading-[34px] font-black tracking-[-.8px]">내 담당 위험</h2>
          <Link className="flex items-center gap-1 text-[14px] font-bold text-[#59636c]" to="/worker/actions">전체보기<AppIcon name="chevronRight" className="h-5 w-5" strokeWidth={2} /></Link>
        </div>
        <div className="space-y-[10px]">
          {assignedRisks.map(risk => <WorkerRiskCard key={risk.id} risk={risk} />)}
        </div>
      </section>

      <Link className="mt-[29px] flex h-[59px] w-full items-center justify-center gap-[14px] rounded-[18px] bg-[linear-gradient(100deg,#ff8226_0%,#ff6d0d_100%)] text-[19px] font-black text-white shadow-[0_10px_24px_rgba(255,111,18,0.12)] transition-[filter,transform] hover:brightness-105 active:scale-[.99]" to="/worker/upload">
        <AppIcon name="uploadCloud" className="h-7 w-7" strokeWidth={2.2} />
        동영상 업로드
      </Link>
    </div>
  );
}
