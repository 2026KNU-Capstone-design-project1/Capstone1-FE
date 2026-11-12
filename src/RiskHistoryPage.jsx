import { useEffect, useMemo, useState } from 'react';
import { getHistory, getHistoryAiAnalysis } from './api/history';
import AppIcon from './components/AppIcon';
import { formatDateTime, toTimestamp } from './utils/dateTime';

const PAGE_SIZE = 8;

const STATUS_TONE = {
  미처리: 'border-[#7a3532] bg-[#3a2222] text-[#ff7770]',
  처리중: 'border-[#9b570f] bg-[#4a301b] text-[#ff981f]',
  해결완료: 'border-[#247a58] bg-[#123f35] text-[#4dde9a]',
};

const EVENT_TONE = {
  default: 'border-app-border-strong bg-[#193442] text-app-text-soft',
  warning: 'border-[#9b570f] bg-[#4a301b] text-[#ff981f]',
  success: 'border-[#247a58] bg-[#123f35] text-[#4dde9a]',
};

function displayDate(value) {
  return formatDateTime(value).slice(0, 10);
}

function displayDateTime(value) {
  if (typeof value === 'string' && /(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatDateTime(parsed).slice(0, 16);
  }

  return formatDateTime(value).slice(0, 16);
}

function FilterSelect({ icon, label, value, onChange, children }) {
  return (
    <label className="relative block min-w-[180px] flex-1 sm:flex-none">
      <span className="sr-only">{label}</span>
      <AppIcon name={icon} className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
      <select
        className="h-11 w-full appearance-none rounded-lg border border-app-border bg-[#071b27] pr-10 pl-12 text-[14px] font-medium text-app-text outline-none transition-colors hover:border-app-border-hover focus:border-app-accent sm:w-[220px]"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-app-text-soft" />
    </label>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <article className="flex min-h-[92px] items-center justify-between gap-5 rounded-xl border border-app-border bg-app-panel-subtle px-7 py-5">
      <div>
        <p className="text-[14px] font-medium text-app-text-soft">{label}</p>
        <p className="mt-1 text-[30px] leading-none font-bold tracking-[-.4px] text-app-text">
          {value}<span className="ml-1 text-[17px]">건</span>
        </p>
      </div>
      <AppIcon name={icon} className="h-8 w-8 shrink-0 text-[#9fb5c4]" />
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex min-w-[82px] justify-center rounded-lg border px-3 py-1.5 text-[13px] font-medium ${STATUS_TONE[status] ?? EVENT_TONE.default}`}>
      {status}
    </span>
  );
}

function RiskTimeline({ risk }) {
  return (
    <div id={`history-${risk.id}`} className="border-t border-app-border-soft bg-[#061b26] px-7 py-6 sm:px-12">
      <div className="grid gap-6 xl:grid-cols-[152px_minmax(0,1fr)] xl:gap-8">
        <h4 className="pt-1 text-[17px] font-bold text-app-text">위험 처리 이력</h4>
        <ol className="w-[640px] max-w-full">
          {risk.events.map((event, index) => {
            const isLast = index === risk.events.length - 1;
            const dotTone = event.tone === 'success'
              ? 'border-[#247a58] bg-[#31d184]'
              : event.tone === 'warning'
                ? 'border-[#a7641d] bg-[#ff971f]'
                : 'border-[#70899a] bg-[#b9ceda]';
            const badgeTone = EVENT_TONE[event.tone ?? 'default'];

            return (
              <li key={event.id ?? `${event.at}-${event.badge}`} className="relative grid min-h-[48px] grid-cols-[18px_190px_1px_184px_118px] items-center gap-x-8 text-[14px]">
                {!isLast && <span className="absolute top-1/2 bottom-[-50%] left-[8px] w-px bg-[#7690a0]" />}
                <span className={`relative z-[1] h-[17px] w-[17px] rounded-full border-[5px] shadow-[0_0_0_3px_rgba(66,91,107,.4)] ${dotTone}`} />
                <time className="whitespace-nowrap font-medium text-app-text">{displayDateTime(event.at)}</time>
                <span className="h-7 w-px bg-app-border-soft" aria-hidden="true" />
                <span className="whitespace-nowrap font-medium text-app-text-soft">{event.description}</span>
                <span className={`inline-flex w-[118px] justify-center rounded-lg border px-3 py-1.5 font-medium ${badgeTone}`}>{event.badge}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default function RiskHistoryPage() {
  const [period, setPeriod] = useState('all');
  const [facility, setFacility] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [summary, setSummary] = useState({ repeated: 0, longUnresolved: 0, rediscovered: 0 });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiError, setAiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      setIsLoading(true);
      setError('');

      try {
        const response = await getHistory({ signal: controller.signal });
        setHistoryItems(response.histories);
        setSummary({
          repeated: response.repeatedDetectionCount,
          longUnresolved: response.longTermUnresolvedCount,
          rediscovered: response.redetectedAfterActionCount,
        });
        setLoadedAt(Date.now());
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || '위험 이력을 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadHistory();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAiAnalysis() {
      setIsAiLoading(true);
      setAiError('');

      try {
        setAiAnalysis(await getHistoryAiAnalysis({ signal: controller.signal }));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setAiError(requestError.message || 'AI 이력 분석을 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsAiLoading(false);
      }
    }

    loadAiAnalysis();
    return () => controller.abort();
  }, []);

  function update(setter) {
    return event => {
      setter(event.target.value);
      setPage(1);
      setExpandedId(null);
    };
  }

  const facilities = useMemo(() => (
    [...new Set(historyItems.map(risk => risk.location).filter(facilityName => facilityName && facilityName !== '-'))]
      .sort((a, b) => a.localeCompare(b, 'ko-KR'))
  ), [historyItems]);

  const risks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 0;
    const periodStart = periodDays
      ? loadedAt - periodDays * 24 * 60 * 60 * 1000
      : 0;

    return historyItems
      .filter(risk => facility === 'all' || risk.location === facility)
      .filter(risk => !periodStart || toTimestamp(risk.lastDetected) >= periodStart)
      .filter(risk => !normalizedQuery || `${risk.displayCode} ${risk.id} ${risk.content} ${risk.area} ${risk.location}`.toLocaleLowerCase('ko-KR').includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === 'detections') return b.detectionCount - a.detectionCount;
        const direction = sort === 'oldest' ? 1 : -1;
        return (toTimestamp(a.firstDetected) - toTimestamp(b.firstDetected)) * direction;
      });
  }, [facility, historyItems, loadedAt, period, query, sort]);

  const pageCount = Math.max(1, Math.ceil(risks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRisks = risks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = risks.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, risks.length);

  function toggleRisk(id) {
    setExpandedId(current => current === id ? null : id);
  }

  return (
    <section className="pb-1" aria-labelledby="risk-history-title">
      <div className="sticky top-[77px] z-20 -mx-5 -mt-[14px] mb-4 bg-app-background px-5 py-[14px] lg:-mx-[21px] lg:px-[21px]">
        <div className="app-content-frame flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 id="risk-history-title" className="text-[28px] font-bold tracking-[-.7px] text-app-text">위험 이력</h2>
          <div className="flex flex-wrap gap-3">
            <FilterSelect icon="calendar" label="기간 선택" value={period} onChange={update(setPeriod)}>
              <option value="all">전체 기간</option>
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
            </FilterSelect>
            <FilterSelect icon="site" label="시설 필터" value={facility} onChange={update(setFacility)}>
              <option value="all">전체 시설</option>
              {facilities.map(facilityName => <option key={facilityName} value={facilityName}>{facilityName}</option>)}
            </FilterSelect>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-3" aria-label="위험 이력 요약">
          <SummaryCard label="반복 탐지 위험" value={summary.repeated} icon="repeat" />
          <SummaryCard label="장기 미해결 위험" value={summary.longUnresolved} icon="clock" />
          <SummaryCard label="조치 이후 재탐지 위험" value={summary.rediscovered} icon="history" />
        </div>

        <aside className="flex items-center gap-5 rounded-xl border border-app-border bg-[linear-gradient(90deg,#0a2130,#081c28)] px-6 py-4" aria-label="AI 이력 분석">
          <div className="flex shrink-0 items-center gap-3 text-[17px] font-bold text-app-text">
            <AppIcon name="sparkles" className="h-7 w-7 text-app-accent" />
            <span>AI 이력 분석</span>
          </div>
          <span className="hidden h-10 w-px shrink-0 bg-app-border-strong sm:block" />
          <p className="whitespace-pre-line text-[14px] leading-6 text-app-text-soft" aria-live="polite">
            {isAiLoading ? 'AI 이력을 분석하는 중입니다.' : (aiError || aiAnalysis)}
          </p>
        </aside>

        <section className="overflow-hidden rounded-xl border border-app-border bg-app-panel" aria-labelledby="risk-history-list-title">
          <div className="flex flex-col gap-3 border-b border-app-border-soft px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-baseline gap-2">
              <h3 id="risk-history-list-title" className="text-[22px] font-bold tracking-[-.4px] text-app-text">위험 이력 목록</h3>
              <span className="text-[13px] text-app-muted">{risks.length}건</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block min-w-0 sm:w-[330px]">
                <span className="sr-only">위험 이력 검색</span>
                <AppIcon name="search" className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
                <input
                  className="h-11 w-full rounded-lg border border-app-border bg-[#071b27] pr-4 pl-11 text-[14px] text-app-text outline-none transition-colors placeholder:text-app-muted hover:border-app-border-hover focus:border-app-accent"
                  type="search"
                  placeholder="위험 ID, 위험 내용 검색"
                  value={query}
                  onChange={update(setQuery)}
                />
              </label>
              <label className="relative block sm:w-[210px]">
                <span className="sr-only">정렬 기준</span>
                <select
                  className="h-11 w-full appearance-none rounded-lg border border-app-border bg-[#071b27] px-4 pr-10 text-[14px] font-medium text-app-text outline-none transition-colors hover:border-app-border-hover focus:border-app-accent"
                  value={sort}
                  onChange={update(setSort)}
                >
                  <option value="latest">최초 발견일 최신순</option>
                  <option value="oldest">최초 발견일 오래된순</option>
                  <option value="detections">탐지 횟수 많은순</option>
                </select>
                <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-app-text-soft" />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1110px] p-3 pt-0">
              <div className="grid grid-cols-[minmax(250px,1.7fr)_minmax(170px,1.05fr)_minmax(125px,.8fr)_minmax(125px,.8fr)_minmax(100px,.65fr)_minmax(140px,.8fr)_64px] items-center border-b border-app-border-soft px-5 py-3 text-[13px] font-medium text-app-text-soft">
                <span>위험 ID / 위험 내용</span>
                <span>발생 구역</span>
                <span>최초 발견일</span>
                <span>최근 탐지일</span>
                <span>탐지 횟수</span>
                <span>현재 처리 상태</span>
                <span className="text-center">이력</span>
              </div>

              <div>
                {pageRisks.map(risk => {
                  const expanded = expandedId === risk.id;
                  return (
                    <article key={risk.id} className={`overflow-hidden transition-colors ${expanded ? 'my-2 rounded-lg border border-app-accent bg-[#0b202c]' : 'border-b border-app-border-soft last:border-b-0'}`}>
                      <button
                        className={`grid min-h-[68px] w-full grid-cols-[minmax(250px,1.7fr)_minmax(170px,1.05fr)_minmax(125px,.8fr)_minmax(125px,.8fr)_minmax(100px,.65fr)_minmax(140px,.8fr)_64px] items-center px-5 text-left text-[14px] text-app-text-soft transition-colors hover:bg-app-hover ${expanded ? 'bg-[linear-gradient(90deg,rgba(255,129,24,.07),rgba(255,255,255,.02))]' : ''}`}
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`history-${risk.id}`}
                        onClick={() => toggleRisk(risk.id)}
                      >
                        <span className="flex min-w-0 items-center gap-4">
                          <span className={`h-8 w-1 shrink-0 rounded-full ${expanded ? 'bg-app-accent' : 'bg-[#bdd1dc]'}`} />
                          <span className="min-w-0">
                            <strong className="block text-[15px] text-app-text">{risk.displayCode}</strong>
                            <span className="mt-0.5 block truncate text-[13px] text-app-text-soft">{risk.content}</span>
                          </span>
                        </span>
                        <span>{risk.area} · {risk.location}</span>
                        <time>{displayDate(risk.firstDetected)}</time>
                        <time>{displayDate(risk.lastDetected)}</time>
                        <span>{risk.detectionCount}회</span>
                        <span><StatusBadge status={risk.status} /></span>
                        <span className="grid place-items-center">
                          <AppIcon name="chevronDown" className={`h-5 w-5 text-app-text transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </span>
                      </button>
                      {expanded && <RiskTimeline risk={risk} />}
                    </article>
                  );
                })}
                {!isLoading && pageRisks.length === 0 && (
                  <div className="grid min-h-40 place-items-center text-[14px] text-app-muted">{error || '조건에 맞는 위험 이력이 없습니다.'}</div>
                )}
                {isLoading && (
                  <div className="grid min-h-40 place-items-center text-[14px] text-app-muted">위험 이력을 불러오는 중입니다.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {!isLoading && risks.length > 0 && (
          <div className="flex min-h-[62px] items-center justify-between gap-4">
            <p className="text-[15px] text-[#9abbd0]">{start}-{end} / {risks.length}건</p>
            <nav className="flex items-center gap-[7px]" aria-label="위험 이력 목록 페이지">
              <button className="grid h-[40px] w-[40px] place-items-center rounded-lg border border-app-border text-app-text-soft transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => { setPage(value => Math.max(1, value - 1)); setExpandedId(null); }}><AppIcon name="chevronLeft" className="h-5 w-5" /></button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => (
                <button key={number} className={`h-[40px] min-w-[40px] rounded-lg border px-3 text-[14px] transition-colors ${number === currentPage ? 'border-app-accent bg-[#101e27] text-app-accent' : 'border-app-border text-[#9abbd0] hover:bg-app-hover'}`} type="button" aria-current={number === currentPage ? 'page' : undefined} onClick={() => { setPage(number); setExpandedId(null); }}>{number}</button>
              ))}
              <button className="grid h-[40px] w-[40px] place-items-center rounded-lg border border-app-border text-app-text-soft transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="다음 페이지" disabled={currentPage === pageCount} onClick={() => { setPage(value => Math.min(pageCount, value + 1)); setExpandedId(null); }}><AppIcon name="chevronRight" className="h-5 w-5" /></button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}

