import { useEffect, useMemo, useRef, useState } from 'react';
import { getFacilityRiskEvents } from './api/dashboard';
import { getRisks } from './api/risks';
import FactoryMap from './components/worker/FactoryMap';
import WorkerRiskCard from './components/worker/WorkerRiskCard';
import { FACTORY_FACILITY_POSITIONS } from './config/factoryFacilityPositions';
import { buildFacilityRiskMarkerData } from './utils/facilityRiskMarkers';

const filters = ['전체', '미처리', '처리 중', '완료'];
const ACTION_STATUS_LABELS = {
  OPEN: '미처리',
  IN_PROGRESS: '처리 중',
  RESOLVED: '완료',
};

function toWorkerActionRisk(risk) {
  return {
    ...risk,
    title: risk.content,
    status: ACTION_STATUS_LABELS[risk.rawStatus] ?? risk.status,
    description: risk.evidence || risk.content,
    guide: '현장 안전 기준에 따라 위험 요소를 확인하고 조치해 주세요.',
  };
}

export default function WorkerActionsPage() {
  const [filter, setFilter] = useState('전체');
  const [actionRisks, setActionRisks] = useState([]);
  const [facilityRiskEvents, setFacilityRiskEvents] = useState([]);
  const [isRiskLoading, setIsRiskLoading] = useState(true);
  const [riskLoadError, setRiskLoadError] = useState('');
  const [facilityRiskError, setFacilityRiskError] = useState('');
  const [highlightedRiskId, setHighlightedRiskId] = useState(null);
  const listRef = useRef(null);
  const cardRefs = useRef(new Map());
  const highlightTimerRef = useRef(null);
  const risks = useMemo(
    () => filter === '전체' ? actionRisks : actionRisks.filter(risk => risk.status === filter),
    [actionRisks, filter],
  );
  const facilityMarkerData = useMemo(
    () => buildFacilityRiskMarkerData(facilityRiskEvents, FACTORY_FACILITY_POSITIONS),
    [facilityRiskEvents],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadActionRisks() {
      setIsRiskLoading(true);
      try {
        const apiRisks = await getRisks({ signal: controller.signal });
        setActionRisks(apiRisks.map(toWorkerActionRisk));
        setRiskLoadError('');
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setActionRisks([]);
          setRiskLoadError(requestError.message || '위험 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsRiskLoading(false);
      }
    }

    async function loadFacilityRisks() {
      try {
        const events = await getFacilityRiskEvents({ signal: controller.signal });
        setFacilityRiskEvents(events);
        setFacilityRiskError('');
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setFacilityRiskEvents([]);
          setFacilityRiskError('시설별 위험 정보를 불러오지 못했습니다.');
        }
      }
    }

    loadActionRisks();
    loadFacilityRisks();
    return () => {
      controller.abort();
      if (highlightTimerRef.current !== null) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  function handleMarkerSelect(marker) {
    const riskById = marker.riskIds
      .map(riskId => actionRisks.find(risk => String(risk.id) === riskId))
      .find(Boolean);
    const riskByEngName = actionRisks.find(risk => (
      String(risk.engName ?? '').trim().toUpperCase() === marker.engName
    ));
    const riskByFacilityName = actionRisks.find(risk => (
      risk.facilityName
      && marker.facilityName
      && risk.facilityName.trim() === marker.facilityName.trim()
    ));
    const targetRisk = riskById ?? riskByEngName ?? riskByFacilityName;
    if (!targetRisk) return;

    const targetRiskId = String(targetRisk.id);

    setFilter('전체');
    setHighlightedRiskId(targetRiskId);

    if (highlightTimerRef.current !== null) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedRiskId(null);
      highlightTimerRef.current = null;
    }, 750);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const list = listRef.current;
        const card = cardRefs.current.get(targetRiskId);
        if (!list || !card) return;

        const hasInternalScroll = list.scrollHeight > list.clientHeight + 1;
        if (!hasInternalScroll) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const listRect = list.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const cardTopInList = list.scrollTop + cardRect.top - listRect.top;
        const centeredScrollTop = cardTopInList - (list.clientHeight - cardRect.height) / 2;
        const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight);

        list.scrollTo({
          top: Math.min(maxScrollTop, Math.max(0, centeredScrollTop)),
          behavior: 'smooth',
        });
      });
    });
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" aria-labelledby="worker-actions-title">
      <h1 id="worker-actions-title" className="ml-[5px] shrink-0 text-[28px] leading-9 font-black tracking-[-1.15px]">내 조치</h1>

      <FactoryMap markers={facilityMarkerData.markers} onMarkerSelect={handleMarkerSelect} />
      {riskLoadError && (
        <p className="mt-2 shrink-0 rounded-xl bg-[#fff2ed] px-3 py-2 text-[12px] font-semibold text-[#b64d21]" role="alert">
          {riskLoadError}
        </p>
      )}
      {facilityRiskError && (
        <p className="mt-2 shrink-0 rounded-xl bg-[#fff2ed] px-3 py-2 text-[12px] font-semibold text-[#b64d21]" role="alert">
          {facilityRiskError}
        </p>
      )}
      {!facilityRiskError && facilityMarkerData.unmappedFacilityNames.length > 0 && (
        <p className="mt-2 shrink-0 rounded-xl bg-[#fff8e4] px-3 py-2 text-[12px] font-semibold text-[#936615]">
          좌표가 설정되지 않은 위험 시설이 {facilityMarkerData.unmappedFacilityNames.length}곳 있습니다.
        </p>
      )}

      <div className="mt-4 flex shrink-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="조치 상태 필터">
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

      <div ref={listRef} className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-4 [scrollbar-color:#b8c2c8_transparent] [scrollbar-width:thin]" aria-label="위험 조치 목록">
        {isRiskLoading && (
          <p className="rounded-[22px] bg-white px-5 py-12 text-center text-[14px] font-semibold text-[#7b868e]" role="status">
            위험 목록을 불러오는 중입니다.
          </p>
        )}
        <div className="space-y-3">
          {!isRiskLoading && risks.map(risk => {
            const riskId = String(risk.id);
            return (
              <div
                key={risk.id}
                ref={element => {
                  if (element) cardRefs.current.set(riskId, element);
                  else cardRefs.current.delete(riskId);
                }}
                className="rounded-[20px]"
              >
                <WorkerRiskCard risk={risk} highlighted={highlightedRiskId === riskId} />
              </div>
            );
          })}
        </div>
        {!isRiskLoading && !riskLoadError && risks.length === 0 && <p className="rounded-[22px] bg-white px-5 py-12 text-center text-[14px] text-[#7b868e]">해당 상태의 조치가 없습니다.</p>}
      </div>
    </section>
  );
}
