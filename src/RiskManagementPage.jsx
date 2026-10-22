import { useMemo, useState } from 'react';
import AppIcon from './components/AppIcon';
import RiskDetailModal from './components/risks/RiskDetailModal';
import { riskManagementMock } from './data/riskManagementMock';
import { formatDateTime, toTimestamp } from './utils/dateTime';

const PAGE_SIZE = 10;

const severityTone = {
  HIGH: 'text-app-danger',
  MEDIUM: 'text-[#ff7770]',
  LOW: 'text-app-text-soft',
};

const statusTone = {
  미처리: 'text-app-danger',
  처리중: 'text-app-muted',
  '해결 완료': 'text-[#28d28b]',
};

function FilterSelect({ label, value, onChange, children, className = '' }) {
  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        className="h-[46px] w-full appearance-none rounded-lg border border-app-border bg-[#071b27] px-5 pr-11 text-[15px] text-app-text outline-none transition-colors hover:border-app-border-hover focus:border-app-accent"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
    </label>
  );
}

export default function RiskManagementPage() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [selectedRisk, setSelectedRisk] = useState(null);

  const risksWithDisplayCode = useMemo(() => {
    const displayCodeById = new Map(
      [...riskManagementMock]
        .sort((a, b) => toTimestamp(a.lastDetected) - toTimestamp(b.lastDetected))
        .map((risk, index) => [risk.id, `RISK-${String(index + 1).padStart(3, '0')}`]),
    );

    return riskManagementMock.map(risk => ({
      ...risk,
      displayCode: displayCodeById.get(risk.id),
    }));
  }, []);

  function update(setter) {
    return event => {
      setter(event.target.value);
      setPage(1);
    };
  }

  const risks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    const periodStart = period === '7d' ? toTimestamp('2026.10.02 00:00:00') : period === '30d' ? toTimestamp('2026.09.09 00:00:00') : 0;

    const filteredRisks = risksWithDisplayCode
      .filter(risk => !normalizedQuery || `${risk.content} ${risk.location}`.toLocaleLowerCase('ko-KR').includes(normalizedQuery))
      .filter(risk => area === 'all' || risk.location.startsWith(area))
      .filter(risk => severity === 'all' || risk.severity === severity)
      .filter(risk => status === 'all' || risk.status === status)
      .filter(risk => !periodStart || toTimestamp(risk.lastDetected) >= periodStart);

    return filteredRisks.sort((a, b) => {
      const detectedOrder = sort === 'latest'
        ? toTimestamp(b.lastDetected) - toTimestamp(a.lastDetected)
        : toTimestamp(a.lastDetected) - toTimestamp(b.lastDetected);

      if (detectedOrder !== 0) return detectedOrder;

      const aDisplayNumber = Number(a.displayCode.slice('RISK-'.length));
      const bDisplayNumber = Number(b.displayCode.slice('RISK-'.length));
      return sort === 'latest'
        ? bDisplayNumber - aDisplayNumber
        : aDisplayNumber - bDisplayNumber;
    });
  }, [area, period, query, risksWithDisplayCode, severity, sort, status]);

  const pageCount = Math.max(1, Math.ceil(risks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRisks = risks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = risks.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, risks.length);

  return (
    <section className="pb-1" aria-labelledby="risk-management-title">
      <div className="mb-[18px] flex min-h-[48px] items-start justify-between gap-4">
        <h2 id="risk-management-title" className="text-[28px] font-bold tracking-[-.7px] text-app-text">위험 관리</h2>
      </div>

      <div className="grid gap-3 rounded-xl border border-app-border bg-[#071b27] p-[14px] md:grid-cols-2 xl:grid-cols-[minmax(260px,2.2fr)_minmax(140px,1fr)_minmax(140px,.94fr)_minmax(140px,1fr)_minmax(210px,1.35fr)_minmax(180px,1.16fr)]">
        <label className="relative block min-w-0">
          <span className="sr-only">위험 검색</span>
          <AppIcon name="search" className="pointer-events-none absolute top-1/2 left-4 h-[25px] w-[25px] -translate-y-1/2 text-app-text-soft" />
          <input
            className="h-[46px] w-full rounded-lg border border-app-border bg-[#071b27] pr-4 pl-[53px] text-[15px] text-app-text outline-none transition-colors placeholder:text-[#54839c] hover:border-app-border-hover focus:border-app-accent"
            type="search"
            placeholder="위험 내용 또는 시설물 검색"
            value={query}
            onChange={update(setQuery)}
          />
        </label>
        <FilterSelect label="구역" value={area} onChange={update(setArea)}>
          <option value="all">전체 구역</option>
          <option value="A구역">A구역</option>
          <option value="B구역">B구역</option>
          <option value="C구역">C구역</option>
        </FilterSelect>
        <FilterSelect label="위험 등급" value={severity} onChange={update(setSeverity)}>
          <option value="all">위험 등급</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </FilterSelect>
        <FilterSelect label="처리 상태" value={status} onChange={update(setStatus)}>
          <option value="all">처리 상태</option>
          <option value="미처리">미처리</option>
          <option value="처리중">처리중</option>
          <option value="해결 완료">해결 완료</option>
        </FilterSelect>
        <label className="relative block min-w-0 border-l border-app-border-soft pl-3">
          <span className="sr-only">발견 기간</span>
          <AppIcon name="calendar" className="pointer-events-none absolute top-1/2 left-7 h-[22px] w-[22px] -translate-y-1/2 text-app-text-soft" />
          <select
            className="h-[46px] w-full appearance-none rounded-lg border border-app-border bg-[#071b27] pr-11 pl-[53px] text-[15px] text-[#54839c] outline-none transition-colors hover:border-app-border-hover focus:border-app-accent"
            value={period}
            onChange={update(setPeriod)}
          >
            <option value="all">발견 기간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
          <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
        </label>
        <label className="relative block min-w-0 border-l border-app-border-soft pl-3">
          <span className="sr-only">정렬</span>
          <AppIcon name="sort" className="pointer-events-none absolute top-1/2 left-7 h-[23px] w-[23px] -translate-y-1/2 text-app-text" />
          <select
            className="h-[46px] w-full appearance-none rounded-lg border border-app-border bg-[#071b27] pr-11 pl-[53px] text-[15px] text-app-text outline-none transition-colors hover:border-app-border-hover focus:border-app-accent"
            value={sort}
            onChange={update(setSort)}
          >
            <option value="latest">최근 발견순</option>
            <option value="oldest">오래된 발견순</option>
          </select>
          <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
        </label>
      </div>

      <p className="mt-[25px] mb-2 text-[22px] font-bold tracking-[-.4px] text-app-text">
        전체 위험 <strong className="ml-1 text-[24px] text-[#ff661f]">{risks.length}</strong><span className="ml-1 font-normal text-[#79a7c0]">건</span>
      </p>

      <div className="overflow-x-auto rounded-t-xl border border-app-border border-b-0">
        <table className="w-full min-w-[1220px] table-fixed border-collapse text-left text-[16px]">
          <colgroup>
            <col className="w-[8%]" /><col className="w-[15%]" /><col className="w-[13.5%]" /><col className="w-[8.5%]" /><col className="w-[8.5%]" />
            <col className="w-[12.5%]" /><col className="w-[12.5%]" /><col className="w-[8.5%]" /><col className="w-[12.5%]" />
          </colgroup>
          <thead className="bg-[#0a2230] text-app-text-soft">
            <tr className="h-[51px]">
              {['ID', '위험 내용', '위치', '위험 등급', '처리 상태', '최초 발견', '최근 발견', '관련 영상', '담당자'].map(label => (
                <th key={label} className="border-r border-app-border-soft px-5 font-medium last:border-r-0">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRisks.map(risk => (
              <tr
                key={risk.id}
                className="h-12 cursor-pointer border-t border-app-border-soft bg-[#061b26] text-app-text-soft transition-colors hover:bg-app-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-app-accent"
                tabIndex="0"
                role="button"
                aria-label={`${risk.displayCode} ${risk.content} 상세 보기`}
                onClick={() => setSelectedRisk(risk)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedRisk(risk);
                  }
                }}
              >
                <td className="border-r border-app-border-soft px-5 text-app-text-soft">{risk.displayCode}</td>
                <td className="truncate border-r border-app-border-soft px-5 font-medium text-app-text">{risk.content}</td>
                <td className="truncate border-r border-app-border-soft px-5">{risk.location}</td>
                <td className={`border-r border-app-border-soft px-5 text-center ${severityTone[risk.severity]}`}>{risk.severity}</td>
                <td className={`border-r border-app-border-soft px-5 text-center ${statusTone[risk.status]}`}>{risk.status}</td>
                <td className="whitespace-nowrap border-r border-app-border-soft px-3">{formatDateTime(risk.firstDetected)}</td>
                <td className="whitespace-nowrap border-r border-app-border-soft px-3">{formatDateTime(risk.lastDetected)}</td>
                <td className="border-r border-app-border-soft px-5">{risk.videos}개</td>
                <td className="px-5">{risk.assignee}</td>
              </tr>
            ))}
            {pageRisks.length === 0 && (
              <tr className="h-48 border-t border-app-border-soft bg-[#061b26]">
                <td colSpan="9" className="text-center text-app-muted">조건에 맞는 위험이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-[78px] items-center justify-between gap-4 border-t border-app-border-soft pt-[20px]">
        <p className="text-[17px] text-[#9abbd0]">{start}-{end} / {risks.length}건</p>
        <nav className="flex items-center gap-[7px]" aria-label="위험 목록 페이지">
          <button className="grid h-[42px] w-[40px] place-items-center rounded-lg border border-app-border text-app-text-soft transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}><AppIcon name="chevronLeft" className="h-5 w-5" /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => (
            <button key={number} className={`h-[42px] min-w-[40px] rounded-lg border px-3 text-[15px] transition-colors ${number === currentPage ? 'border-app-accent bg-[#101e27] text-app-accent' : 'border-app-border text-[#9abbd0] hover:bg-app-hover'}`} type="button" aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>
          ))}
          <button className="grid h-[42px] w-[40px] place-items-center rounded-lg border border-app-border text-app-text-soft transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="다음 페이지" disabled={currentPage === pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}><AppIcon name="chevronRight" className="h-5 w-5" /></button>
        </nav>
      </div>

      {selectedRisk && <RiskDetailModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </section>
  );
}
