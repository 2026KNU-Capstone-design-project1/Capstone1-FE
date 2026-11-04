import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import { workerMock } from './data/workerMock';

const severityStyles = {
  HIGH: 'bg-[#fff0eb] text-[#ee641e]',
  MEDIUM: 'bg-[#fff7df] text-[#aa7518]',
  LOW: 'bg-[#edf3f6] text-[#5a6873]',
};

export default function WorkerRiskDetailPage() {
  const { riskId } = useParams();
  const risk = workerMock.risks.find(item => item.id === riskId);
  const [status, setStatus] = useState(risk?.status || '미처리');
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);

  if (!risk) {
    return (
      <div className="rounded-[24px] bg-white p-8 text-center">
        <p className="font-bold">조치 정보를 찾을 수 없습니다.</p>
        <Link className="mt-4 inline-block text-sm font-bold text-app-accent" to="/worker/actions">내 조치로 돌아가기</Link>
      </div>
    );
  }

  function saveAction() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <article>
      <Link className="mb-4 inline-flex items-center gap-1 text-[14px] font-bold text-[#65717a]" to="/worker/actions">
        <AppIcon name="chevronLeft" className="h-5 w-5" strokeWidth={2} />내 조치
      </Link>

      <div className="rounded-[26px] bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#8a949b]">{risk.id}</p>
            <h1 className="mt-2 text-[26px] font-black tracking-[-1px]">{risk.title}</h1>
            <p className="mt-1 text-[14px] text-[#66737c]">{risk.location}</p>
          </div>
          <span className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-extrabold ${severityStyles[risk.severity]}`}>{risk.severity}</span>
        </div>

        <dl className="mt-6 grid grid-cols-[82px_1fr] gap-y-3 border-t border-[#edf0f2] pt-5 text-[14px]">
          <dt className="font-semibold text-[#89939a]">감지 시각</dt><dd className="font-semibold">{risk.detectedAt}</dd>
          <dt className="font-semibold text-[#89939a]">현재 상태</dt><dd className="font-semibold text-app-accent">{status}</dd>
        </dl>

        <div className="mt-6 rounded-2xl bg-[#f5f7f8] p-4">
          <h2 className="text-[14px] font-extrabold">위험 내용</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#5f6c75]">{risk.description}</p>
        </div>
        <div className="mt-3 rounded-2xl bg-[#fff6f0] p-4">
          <h2 className="text-[14px] font-extrabold text-[#d86022]">조치 가이드</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#695f59]">{risk.guide}</p>
        </div>
      </div>

      <section className="mt-5 rounded-[26px] bg-white p-5" aria-labelledby="action-update-title">
        <h2 id="action-update-title" className="text-[18px] font-black">조치 상태 업데이트</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['미처리', '처리 중', '완료'].map(item => (
            <button key={item} className={`rounded-xl py-3 text-[13px] font-bold ${status === item ? 'bg-[#172630] text-white' : 'bg-[#f1f4f5] text-[#66737c]'}`} type="button" onClick={() => setStatus(item)}>{item}</button>
          ))}
        </div>
        <label className="mt-5 block text-[13px] font-bold" htmlFor="worker-action-note">조치 메모</label>
        <textarea id="worker-action-note" className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-[#dfe5e8] bg-[#f8fafb] p-4 text-[14px] outline-none focus:border-app-accent" placeholder="현장 조치 내용을 입력해 주세요." value={memo} onChange={event => setMemo(event.target.value)} />
        <div className="mt-3 grid">
          <button className="rounded-2xl bg-app-accent py-3.5 text-[14px] font-extrabold text-white" type="button" onClick={saveAction}>{saved ? '저장되었습니다' : '변경 내용 저장'}</button>
        </div>
      </section>
    </article>
  );
}
