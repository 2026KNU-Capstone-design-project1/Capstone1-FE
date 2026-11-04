import { useMemo, useState } from 'react';
import WorkerRiskCard from './components/worker/WorkerRiskCard';
import { workerMock } from './data/workerMock';

const filters = ['전체', '미처리', '처리 중', '완료'];

export default function WorkerActionsPage() {
  const [filter, setFilter] = useState('전체');
  const risks = useMemo(
    () => filter === '전체' ? workerMock.risks : workerMock.risks.filter(risk => risk.status === filter),
    [filter],
  );

  return (
    <section aria-labelledby="worker-actions-title">
      <h1 id="worker-actions-title" className="mt-1 text-[28px] font-black tracking-[-1.2px]">내 조치</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="조치 상태 필터">
        {filters.map(item => (
          <button
            key={item}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${filter === item ? 'bg-[#172630] text-white' : 'bg-white text-[#65717a]'}`}
            type="button"
            role="tab"
            aria-selected={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {risks.map(risk => <WorkerRiskCard key={risk.id} risk={risk} />)}
      </div>
      {risks.length === 0 && <p className="rounded-[22px] bg-white px-5 py-12 text-center text-[14px] text-[#7b868e]">해당 상태의 조치가 없습니다.</p>}
    </section>
  );
}
