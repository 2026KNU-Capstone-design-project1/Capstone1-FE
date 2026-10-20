import { useMemo, useState } from 'react';
import AppIcon from './components/AppIcon';
import { videoFoldersMock } from './data/videoFoldersMock';

const monthFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
});

function parseDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function monthKey(date) {
  return date.slice(0, 7);
}

function FolderIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h6.2l2.5 3H26a2.5 2.5 0 0 1 2.5 2.5v1H3.5v-4Z" fill="#f58a2b" />
      <path d="M3 12.5h26l-1.4 13.1a2.5 2.5 0 0 1-2.5 2.2H6.9a2.5 2.5 0 0 1-2.5-2.2L3 12.5Z" fill="#ff8a25" />
    </svg>
  );
}

function UploadIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function FailureIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path d="M10 5.8v5.1M10 14.1h.01" stroke="#281c24" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FilterSelect({ label, value, onChange, children, icon }) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      {icon && <AppIcon name={icon} className="pointer-events-none absolute top-1/2 left-4 h-[22px] w-[22px] -translate-y-1/2 text-app-text-soft" />}
      <select
        className={`h-[46px] w-full appearance-none rounded-lg border border-app-border bg-[#071b27] pr-11 text-[15px] text-app-text outline-none transition-colors hover:border-app-border-hover focus:border-app-accent ${icon ? 'pl-[50px]' : 'pl-5'}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
    </label>
  );
}

function FolderCard({ folder }) {
  const allResolved = folder.unresolvedCount === 0;

  return (
    <article className="group flex min-h-[190px] flex-col rounded-xl border border-app-border bg-[#071c28] px-[18px] py-[17px] transition-colors hover:border-app-border-hover hover:bg-[#09212e]">
      <div className="flex items-start gap-4">
        <FolderIcon className="h-[34px] w-[34px] shrink-0" />
        <div className="min-w-0 flex-1 pt-0.5">
          <h4 className="text-[17px] font-bold tracking-[-.15px] text-app-text">{folder.date.replaceAll('-', '.')}</h4>
          <p className="mt-[4px] mb-[10px] text-[14px] text-app-text-soft">
            영상 {folder.videoCount}개 <span className="mx-1 text-app-muted">·</span> 분석 완료 {folder.analyzedCount}/{folder.videoCount}
          </p>
        </div>
        <button className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-app-text-soft transition-colors hover:bg-[#14303f] hover:text-white" type="button" aria-label={`${folder.date} 폴더 메뉴`}>
          <AppIcon name="more" className="h-5 w-5" />
        </button>
      </div>

      <div className="border-t border-app-border-soft pt-3">
        <div className="grid min-h-[49px] grid-cols-3 divide-x divide-app-border-soft">
          <div className="px-2 text-center first:pl-0">
            <p className="text-[12px] text-app-muted">위험 이슈</p>
            <p className="mt-0.5 text-[21px] font-bold text-[#a9bac6]">{folder.riskIssueCount}<span className="text-[15px]">건</span></p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[12px] font-medium text-app-danger">고위험</p>
            <p className="mt-0.5 text-[21px] font-bold text-app-danger">{folder.highRiskCount}<span className="text-[15px]">건</span></p>
          </div>
          <div className="px-2 text-center last:pr-0">
            <p className={`text-[12px] font-medium ${allResolved ? 'text-[#43d596]' : 'text-[#4ba3f5]'}`}>미해결 위험</p>
            <p className={`mt-0.5 text-[21px] font-bold ${allResolved ? 'text-[#43d596]' : 'text-[#4ba3f5]'}`}>
              {folder.unresolvedCount}<span className="text-[15px]">건</span>
            </p>
          </div>
        </div>
        {folder.analysisFailedCount > 0 && (
          <div className="mt-2 flex h-[27px] items-center gap-2 rounded-lg bg-[#30212d] px-2.5 text-[12px] text-app-danger">
            <FailureIcon className="h-[17px] w-[17px] shrink-0" />
            <span>분석 실패 {folder.analysisFailedCount}개</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function VideoManagementPage() {
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('latest');
  const [collapsedMonths, setCollapsedMonths] = useState(new Set());

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().replaceAll('.', '-');
    const periodStart = period === 'october' ? '2026-10-01' : period === 'september' ? '2026-09-01' : null;
    const periodEnd = period === 'october' ? '2026-10-31' : period === 'september' ? '2026-09-30' : null;

    const folders = videoFoldersMock
      .filter(folder => !normalizedQuery || folder.date.includes(normalizedQuery))
      .filter(folder => !periodStart || (folder.date >= periodStart && folder.date <= periodEnd))
      .filter(folder => {
        const remainingAnalysisCount = Math.max(0, folder.videoCount - folder.analyzedCount);
        if (status === 'complete') return remainingAnalysisCount === 0;
        if (status === 'pending') return remainingAnalysisCount > 0;
        if (status === 'failed') return folder.analysisFailedCount > 0;
        return true;
      })
      .sort((a, b) => sort === 'latest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

    return folders.reduce((result, folder) => {
      const key = monthKey(folder.date);
      const group = result.find(item => item.key === key);
      if (group) group.folders.push(folder);
      else result.push({ key, label: monthFormatter.format(parseDate(`${key}-01`)), folders: [folder] });
      return result;
    }, []);
  }, [period, query, sort, status]);

  function toggleMonth(key) {
    setCollapsedMonths(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <section className="flex h-[calc(100dvh-125px)] min-h-[540px] flex-col overflow-hidden" aria-labelledby="video-management-title">
      <div className="shrink-0 pb-[18px]">
        <div className="mb-[18px] flex items-center justify-between gap-4">
          <h2 id="video-management-title" className="text-[28px] font-bold tracking-[-.7px] text-app-text">영상 관리</h2>
          <button className="flex h-[48px] shrink-0 items-center gap-2 rounded-lg bg-app-accent px-6 text-[14px] font-bold text-[#071823] transition-colors hover:bg-[#ff982f]" type="button">
            <UploadIcon className="h-5 w-5" />
            영상 업로드
          </button>
        </div>

        <div className="grid gap-3 rounded-xl border border-app-border bg-[#071b27] p-[14px] md:grid-cols-2 xl:grid-cols-[minmax(265px,1.45fr)_minmax(170px,.88fr)_minmax(300px,2.4fr)_minmax(170px,.86fr)]">
          <FilterSelect label="조회 기간" value={period} onChange={event => setPeriod(event.target.value)} icon="calendar">
            <option value="all">전체 기간</option>
            <option value="october">2026.10.01 ~ 2026.10.31</option>
            <option value="september">2026.09.01 ~ 2026.09.30</option>
          </FilterSelect>
          <FilterSelect label="분석 상태" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="all">분석 상태</option>
            <option value="complete">분석 완료</option>
            <option value="pending">분석 대기</option>
            <option value="failed">분석 실패</option>
          </FilterSelect>
          <label className="relative block min-w-0">
            <span className="sr-only">영상 폴더 검색</span>
            <AppIcon name="search" className="pointer-events-none absolute top-1/2 left-4 h-[25px] w-[25px] -translate-y-1/2 text-app-text-soft" />
            <input
              className="h-[46px] w-full rounded-lg border border-app-border bg-[#071b27] pr-4 pl-[53px] text-[15px] text-app-text outline-none transition-colors placeholder:text-[#6f8796] hover:border-app-border-hover focus:border-app-accent"
              type="search"
              placeholder="날짜로 검색 (예: 2026-10-19)"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <FilterSelect label="정렬" value={sort} onChange={event => setSort(event.target.value)} icon="sort">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </FilterSelect>
        </div>
      </div>

      <div className="video-folder-scrollbar min-h-0 flex-1 overflow-y-auto pr-1" aria-label="월별 영상 폴더 목록">
        {groups.map(group => {
          const collapsed = collapsedMonths.has(group.key);
          return (
            <section key={group.key} className="mb-6 last:mb-0" aria-labelledby={`month-${group.key}`}>
              <button
                className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-app-border-soft bg-app-background/95 py-2 text-left backdrop-blur-sm"
                type="button"
                aria-expanded={!collapsed}
                onClick={() => toggleMonth(group.key)}
              >
                <span className="flex items-baseline gap-2">
                  <span id={`month-${group.key}`} className="text-[21px] font-bold tracking-[-.4px] text-app-text">{group.label}</span>
                  <span className="text-[13px] text-app-muted">{group.folders.length}개 폴더</span>
                </span>
                <AppIcon name="chevronDown" className={`mr-2 h-5 w-5 text-app-text-soft transition-transform ${collapsed ? '-rotate-90' : ''}`} />
              </button>
              {!collapsed && (
                <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.folders.map(folder => <FolderCard key={folder.date} folder={folder} />)}
                </div>
              )}
            </section>
          );
        })}

        {groups.length === 0 && (
          <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-app-border text-center">
            <div>
              <p className="font-medium text-app-text-soft">조건에 맞는 영상 폴더가 없습니다.</p>
              <p className="mt-1 text-sm text-app-muted">검색어나 필터를 변경해 주세요.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
