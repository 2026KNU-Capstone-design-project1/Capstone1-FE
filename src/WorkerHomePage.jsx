import { Link } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import WorkerRiskCard from './components/worker/WorkerRiskCard';
import { workerMock } from './data/workerMock';

export default function WorkerHomePage() {
  const priorityRisk = workerMock.risks.find(risk => risk.id === workerMock.priorityActionId);
  const assignedRisks = workerMock.risks.filter(risk => risk.id !== workerMock.priorityActionId && risk.status !== '완료').slice(0, 2);

  return (
    <div className="space-y-8">
      <section aria-labelledby="worker-summary-title">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 id="worker-summary-title" className="text-[30px] font-black tracking-[-1.2px]">내 담당 조치</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 rounded-[24px] bg-white px-2 py-6">
          {workerMock.summary.map((item, index) => (
            <div key={item.id} className={`text-center ${index > 0 ? 'border-l border-[#e2e7ea]' : ''}`}>
              <p className="text-[14px] font-semibold text-[#59636c]">{item.label}</p>
              <p className={`mt-1 text-[34px] font-black leading-none ${item.tone === 'accent' ? 'text-app-accent' : 'text-[#0d1b25]'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="priority-action-title">
        <h2 id="priority-action-title" className="mb-4 text-[24px] font-black tracking-[-.8px]">우선 조치</h2>
        <WorkerRiskCard risk={priorityRisk} priority />
      </section>

      <section aria-labelledby="assigned-risk-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="assigned-risk-title" className="text-[24px] font-black tracking-[-.8px]">내 담당 위험</h2>
          <Link className="flex items-center gap-1 text-[14px] font-bold text-[#59636c]" to="/worker/actions">전체보기<AppIcon name="chevronRight" className="h-5 w-5" strokeWidth={2} /></Link>
        </div>
        <div className="space-y-3">
          {assignedRisks.map(risk => <WorkerRiskCard key={risk.id} risk={risk} />)}
        </div>
      </section>

      <Link className="flex h-[68px] w-full items-center justify-center gap-3 rounded-[20px] bg-app-accent text-[20px] font-black text-white transition-colors hover:bg-app-accent-dark active:scale-[.99]" to="/worker/upload">
        <AppIcon name="uploadCloud" className="h-7 w-7" strokeWidth={2.2} />
        동영상 업로드
      </Link>
    </div>
  );
}
