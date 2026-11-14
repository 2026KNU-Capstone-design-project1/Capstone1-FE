import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getWorkerHome } from './api/worker';
import AppIcon from './components/AppIcon';
import WorkerRiskCard from './components/worker/WorkerRiskCard';

export default function WorkerHomePage() {
  const { setWorkerUserName } = useOutletContext();
  const [workerHome, setWorkerHome] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkerHome() {
      setIsLoading(true);
      setError('');

      try {
        const response = await getWorkerHome({ signal: controller.signal });
        setWorkerHome(response);
        setWorkerUserName(response.userName);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || '작업자 홈 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadWorkerHome();
    return () => controller.abort();
  }, [setWorkerUserName]);

  const summary = useMemo(() => [
    { id: 'pending', label: '미처리', value: workerHome?.openedCount ?? 0, tone: 'accent' },
    { id: 'progress', label: '처리 중', value: workerHome?.inProgressCount ?? 0, tone: 'default' },
    { id: 'done', label: '완료', value: workerHome?.completedCount ?? 0, tone: 'default' },
  ], [workerHome]);

  const priorityRisk = workerHome?.mostPriorRisk ?? null;
  const assignedRisks = (workerHome?.risks ?? [])
    .slice(0, 3);

  return (
    <div>
      <section aria-labelledby="worker-summary-title">
        <h1 id="worker-summary-title" className="ml-[5px] text-[28px] leading-9 font-black tracking-[-1.15px]">내 담당 조치</h1>
        <div className="mt-[15px] grid h-[115px] grid-cols-3 items-center rounded-[22px] bg-white px-2 shadow-[0_8px_30px_rgba(35,54,68,0.025)]">
          {summary.map((item, index) => (
            <div key={item.id} className={`flex h-[62px] flex-col items-center justify-center text-center ${index > 0 ? 'border-l border-[#e1e6e9]' : ''}`}>
              <p className="text-[16px] leading-5 font-bold text-[#59636c]">{item.label}</p>
              <p className={`mt-[9px] text-[31px] leading-[30px] font-black ${item.tone === 'accent' ? 'text-[#ff6811]' : 'text-[#0d1b25]'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {isLoading && (
        <div className="mt-[31px] grid min-h-[180px] place-items-center rounded-[22px] bg-white px-5 text-center text-[14px] font-semibold text-[#7b868e]" role="status">
          내 담당 조치를 불러오는 중입니다.
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-[31px] grid min-h-[180px] place-items-center rounded-[22px] bg-white px-5 text-center text-[14px] font-semibold text-[#d65d21]" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <section className="mt-[31px]" aria-labelledby="priority-action-title">
            <h2 id="priority-action-title" className="mb-[12px] ml-[5px] text-[24px] leading-[34px] font-black tracking-[-.8px]">우선 조치</h2>
            {priorityRisk
              ? <WorkerRiskCard risk={priorityRisk} priority />
              : <p className="rounded-[19px] bg-white px-5 py-8 text-center text-[14px] text-[#7b868e]">우선 조치할 위험이 없습니다.</p>}
          </section>

          <section className="mt-[32px]" aria-labelledby="assigned-risk-title">
            <div className="mb-[11px] flex h-[34px] items-center justify-between">
              <h2 id="assigned-risk-title" className="ml-[5px] text-[24px] leading-[34px] font-black tracking-[-.8px]">내 담당 위험</h2>
              <Link className="flex items-center gap-1 text-[14px] font-bold text-[#59636c]" to="/worker/actions">전체보기<AppIcon name="chevronRight" className="h-5 w-5" strokeWidth={2} /></Link>
            </div>
            <div className="space-y-[10px]">
              {assignedRisks.map(risk => <WorkerRiskCard key={risk.id} risk={risk} />)}
              {assignedRisks.length === 0 && <p className="rounded-[19px] bg-white px-5 py-8 text-center text-[14px] text-[#7b868e]">담당할 위험이 없습니다.</p>}
            </div>
          </section>
        </>
      )}

      <Link className="mt-[29px] flex h-[59px] w-full items-center justify-center gap-[14px] rounded-[18px] bg-[linear-gradient(100deg,#ff8226_0%,#ff6d0d_100%)] text-[19px] font-black text-white shadow-[0_10px_24px_rgba(255,111,18,0.12)] transition-[filter,transform] hover:brightness-105 active:scale-[.99]" to="/worker/upload">
        <AppIcon name="uploadCloud" className="h-7 w-7" strokeWidth={2.2} />
        동영상 업로드
      </Link>
    </div>
  );
}
