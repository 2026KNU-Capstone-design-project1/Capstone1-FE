import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRisk } from './api/risks';
import AppIcon from './components/AppIcon';
import { formatIsoDateTimeSeconds } from './utils/dateTime';

const severityStyles = {
  HIGH: 'bg-[#fff0eb] text-[#ee641e]',
  MEDIUM: 'bg-[#fff7df] text-[#aa7518]',
  LOW: 'bg-[#edf3f6] text-[#5a6873]',
};

const statusLabels = {
  OPEN: '미처리',
  IN_PROGRESS: '처리 중',
  RESOLVED: '완료',
};

function getBoundingBoxStyle(bbox) {
  if (!bbox) return null;

  const x = Number(bbox.x);
  const y = Number(bbox.y);
  const width = Number(bbox.width);
  const height = Number(bbox.height ?? bbox.width);
  const values = [x, y, width, height];

  if (values.some(value => !Number.isFinite(value) || value < 0 || value > 1)) return null;
  if (width === 0 || height === 0 || x >= 1 || y >= 1) return null;

  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${Math.min(width, 1 - x) * 100}%`,
    height: `${Math.min(height, 1 - y) * 100}%`,
  };
}

function BackToActionsLink() {
  return (
    <Link className="mb-4 inline-flex items-center gap-1 text-[14px] font-bold text-[#65717a]" to="/worker/actions">
      <AppIcon name="chevronLeft" className="h-5 w-5" strokeWidth={2} />내 조치
    </Link>
  );
}

export default function WorkerRiskDetailPage() {
  const { riskId = '' } = useParams();
  const [risk, setRisk] = useState(null);
  const [status, setStatus] = useState('미처리');
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const apiRiskId = riskId.replace(/^RISK-/i, '');

    async function loadRiskDetail() {
      setIsLoading(true);
      try {
        const nextRisk = await getRisk(apiRiskId, { signal: controller.signal });
        setRisk(nextRisk);
        setStatus(statusLabels[nextRisk.rawStatus] ?? nextRisk.status ?? '미처리');
        setImageFailed(false);
        setError('');
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setRisk(null);
          setError(requestError.message || '위험 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadRiskDetail();
    return () => controller.abort();
  }, [riskId]);

  function saveAction() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  if (isLoading) {
    return (
      <div>
        <BackToActionsLink />
        <div className="grid min-h-[280px] place-items-center rounded-[24px] bg-white px-6 text-center text-[14px] font-semibold text-[#7b868e]" role="status">
          위험 상세 정보를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div>
        <BackToActionsLink />
        <div className="rounded-[24px] bg-white p-8 text-center" role="alert">
          <p className="font-bold">{error || '조치 정보를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const boundingBoxStyle = getBoundingBoxStyle(risk.bbox);

  return (
    <article>
      <BackToActionsLink />

      <div className="rounded-[26px] bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#8a949b]">{risk.displayCode}</p>
            <h1 className="mt-2 text-[26px] font-black tracking-[-1px]">{risk.content}</h1>
            <p className="mt-1 text-[14px] text-[#66737c]">{risk.location}</p>
          </div>
          <span className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-extrabold ${severityStyles[risk.severity] ?? severityStyles.LOW}`}>
            {risk.severity}
          </span>
        </div>

        {risk.image && !imageFailed && (
          <div className="relative mt-5 overflow-hidden rounded-2xl bg-[#eef2f4]">
            <img
              className="block h-auto w-full"
              src={risk.image}
              alt={`${risk.content} 감지 이미지`}
              onError={() => setImageFailed(true)}
            />
            {boundingBoxStyle && (
              <span
                className="pointer-events-none absolute border-[3px] border-[#ff3838] bg-[#ff3838]/10 shadow-[0_0_0_1px_rgba(0,0,0,.4),0_0_12px_rgba(255,56,56,.5)]"
                style={boundingBoxStyle}
                role="img"
                aria-label="위험 감지 영역"
              />
            )}
          </div>
        )}
        {risk.image && imageFailed && (
          <div className="mt-5 grid h-[160px] place-items-center rounded-2xl bg-[#eef2f4] px-5 text-center text-[13px] font-semibold text-[#7b868e]" role="status">
            감지 이미지를 불러오지 못했습니다.
          </div>
        )}

        <dl className="mt-6 grid grid-cols-[82px_1fr] gap-y-3 border-t border-[#edf0f2] pt-5 text-[14px]">
          <dt className="font-semibold text-[#89939a]">감지 시각</dt>
          <dd className="font-semibold">{formatIsoDateTimeSeconds(risk.detectedAt)}</dd>
          <dt className="font-semibold text-[#89939a]">현재 상태</dt>
          <dd className="font-semibold text-app-accent">{status}</dd>
        </dl>

        <div className="mt-6 rounded-2xl bg-[#f5f7f8] p-4">
          <h2 className="text-[14px] font-extrabold">위험 내용</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#5f6c75]">{risk.evidence || risk.content}</p>
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
