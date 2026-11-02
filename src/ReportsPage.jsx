import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports } from './api/reports';
import AppIcon from './components/AppIcon';
import { formatDateTime, toTimestamp } from './utils/dateTime';

const PAGE_SIZE = 7;

const TYPE_META = {
  regular: { label: '정기', tone: 'bg-[#0b354c] text-[#50c7ff]' },
  adHoc: { label: '수시', tone: 'bg-[#332d27] text-app-accent' },
};

const RISK_LEVEL_META = {
  HIGH: 'border-[#ff5964]/30 bg-[#3a2029] text-[#ff747d]',
  MEDIUM: 'border-[#ff9b42]/30 bg-[#382a22] text-[#ffad63]',
  LOW: 'border-[#4eb8ff]/30 bg-[#133149] text-[#69c3ff]',
};

function displayDate(value) {
  return value?.replaceAll('-', '.') ?? '-';
}

function nowDateTime() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function SelectField({ label, value, onChange, icon, children, className = '' }) {
  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>
      {icon && <AppIcon name={icon} className="pointer-events-none absolute top-1/2 left-4 h-[23px] w-[23px] -translate-y-1/2 text-app-text-soft" />}
      <select
        className={`h-[48px] w-full appearance-none rounded-lg border border-app-border bg-[#071b27] pr-11 text-[15px] font-medium text-app-text outline-none transition-colors hover:border-app-border-hover focus:border-app-accent ${icon ? 'pl-[52px]' : 'pl-5'}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <AppIcon name="chevronDown" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-app-text-soft" />
    </label>
  );
}

function ReportFormModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('adHoc');
  const [analysisStart, setAnalysisStart] = useState('2026-10-01');
  const [analysisEnd, setAnalysisEnd] = useState('2026-10-30');
  const [error, setError] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('보고서명을 입력해 주세요.');
      return;
    }
    if (analysisStart > analysisEnd) {
      setError('분석 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    onCreate({
      name: name.trim(),
      type,
      analysisStart,
      analysisEnd,
      riskCount: Math.max(1, Math.round((toTimestamp(`${analysisEnd} 00:00`) - toTimestamp(`${analysisStart} 00:00`)) / 86400000 / 2) + 3),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="w-full max-w-[560px] rounded-xl border border-app-border-strong bg-[#0a1d29] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="create-report-title">
        <div className="flex items-center justify-between border-b border-app-border-soft px-6 py-5">
          <div>
            <h3 id="create-report-title" className="text-[22px] font-bold text-app-text">AI 보고서 생성</h3>
            <p className="mt-1 text-sm text-app-muted">분석할 기간과 보고서 유형을 선택해 주세요.</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-app-muted transition-colors hover:bg-app-hover hover:text-white" type="button" onClick={onClose} aria-label="닫기"><AppIcon name="close" className="h-5 w-5" /></button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-app-text-soft">보고서명</span>
            <input ref={nameRef} className="h-12 w-full rounded-lg border border-app-border bg-[#071b27] px-4 text-[15px] text-app-text outline-none placeholder:text-app-muted focus:border-app-accent" value={name} onChange={event => { setName(event.target.value); setError(''); }} placeholder="예: 10월 안전 종합 분석 보고서" />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-app-text-soft">보고서 유형</legend>
            <div className="grid grid-cols-2 gap-3">
              {[['regular', '정기 보고서'], ['adHoc', '수시 보고서']].map(([value, label]) => (
                <label key={value} className={`flex h-12 cursor-pointer items-center justify-center rounded-lg border text-[15px] font-medium transition-colors ${type === value ? 'border-app-accent bg-app-active text-app-accent' : 'border-app-border bg-[#071b27] text-app-text-soft hover:border-app-border-hover'}`}>
                  <input className="sr-only" type="radio" name="reportType" value={value} checked={type === value} onChange={event => setType(event.target.value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-app-text-soft">분석 시작일</span>
              <input className="h-12 w-full rounded-lg border border-app-border bg-[#071b27] px-4 text-[15px] text-app-text outline-none focus:border-app-accent [color-scheme:dark]" type="date" value={analysisStart} onChange={event => { setAnalysisStart(event.target.value); setError(''); }} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-app-text-soft">분석 종료일</span>
              <input className="h-12 w-full rounded-lg border border-app-border bg-[#071b27] px-4 text-[15px] text-app-text outline-none focus:border-app-accent [color-scheme:dark]" type="date" value={analysisEnd} onChange={event => { setAnalysisEnd(event.target.value); setError(''); }} required />
            </label>
          </div>

          {error && <p className="rounded-lg bg-[#30212d] px-4 py-3 text-sm text-app-danger" role="alert">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button className="h-11 rounded-lg border border-app-border px-5 text-sm font-medium text-app-text-soft transition-colors hover:bg-app-hover" type="button" onClick={onClose}>취소</button>
            <button className="h-11 rounded-lg bg-app-accent px-6 text-sm font-bold text-[#071823] transition-colors hover:bg-[#ff982f]" type="submit">보고서 생성</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [riskReports, setRiskReports] = useState([]);
  const [activeCategory, setActiveCategory] = useState('individual');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('tab')) return;

    url.searchParams.delete('tab');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      setIsLoading(true);
      setLoadError('');

      try {
        setRiskReports(await getReports({ signal: controller.signal }));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setLoadError(requestError.message || '보고서 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadReports();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function closeMenu(event) {
      if (!event.target.closest('[data-report-menu]')) setOpenMenu(null);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('pointerdown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function resetPage(setter) {
    return value => {
      setter(value);
      setPage(1);
      setOpenMenu(null);
    };
  }

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR').replaceAll('-', '.');
    const source = activeCategory === 'summary' ? reports : riskReports;
    return [...source]
      .filter(item => {
        if (typeFilter === 'all') return true;
        return activeCategory === 'summary' ? item.type === typeFilter : item.riskType === typeFilter;
      })
      .filter(item => {
        if (!normalizedQuery) return true;
        const haystack = activeCategory === 'summary'
          ? `${item.name} ${displayDate(item.analysisStart)} ${displayDate(item.analysisEnd)} ${formatDateTime(item.createdAt)}`
          : `${item.id} ${item.riskContent} ${item.location} ${item.riskType} ${item.riskLevel} ${formatDateTime(item.createdAt)}`;
        return haystack.toLocaleLowerCase('ko-KR').replaceAll('-', '.').includes(normalizedQuery);
      })
      .filter(item => period === 'all' || item.createdAt?.slice(0, 7).replace('.', '-') === period)
      .sort((a, b) => {
        if (sort === 'oldest') return toTimestamp(a.createdAt) - toTimestamp(b.createdAt);
        if (sort === 'name') return (a.name ?? a.riskContent).localeCompare(b.name ?? b.riskContent, 'ko-KR');
        if (sort === 'risk') {
          if (activeCategory === 'individual') {
            const priority = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priority[b.riskLevel] - priority[a.riskLevel] || toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
          }
          return b.riskCount - a.riskCount || toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
        }
        return toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
      });
  }, [activeCategory, period, query, reports, riskReports, sort, typeFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageReports = filteredReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = filteredReports.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filteredReports.length);

  const riskTypes = useMemo(() => [...new Set(riskReports.map(report => report.riskType).filter(type => type && type !== '-'))].sort((a, b) => a.localeCompare(b, 'ko-KR')), [riskReports]);
  const periods = useMemo(() => [...new Set(riskReports.map(report => report.createdAt?.slice(0, 7)).filter(Boolean))].sort().reverse(), [riskReports]);

  function createReport(values) {
    const nextNumber = reports.reduce((max, report) => Math.max(max, Number(report.id.replace('REPORT-', '')) || 0), 0) + 1;
    const newReport = { ...values, id: `REPORT-${String(nextNumber).padStart(3, '0')}`, createdAt: nowDateTime(), status: '생성 완료' };
    setReports(current => [newReport, ...current]);
    setActiveCategory('summary');
    setTypeFilter('all');
    setQuery('');
    setPeriod('all');
    setSort('latest');
    setPage(1);
    setCreateOpen(false);
  }

  function duplicateItem(item) {
    if (activeCategory === 'individual') {
      const nextNumber = riskReports.reduce((max, risk) => Math.max(max, Number(risk.id.replace('RISK-', '')) || 0), 0) + 1;
      setRiskReports(current => [{ ...item, id: `RISK-${String(nextNumber).padStart(3, '0')}`, createdAt: nowDateTime() }, ...current]);
      setTypeFilter('all');
      setPeriod('all');
      setSort('latest');
      setPage(1);
      setOpenMenu(null);
      return;
    }
    const nextNumber = reports.reduce((max, item) => Math.max(max, Number(item.id.replace('REPORT-', '')) || 0), 0) + 1;
    setReports(current => [{ ...item, id: `REPORT-${String(nextNumber).padStart(3, '0')}`, name: `${item.name} 사본`, createdAt: nowDateTime() }, ...current]);
    setTypeFilter('all');
    setPeriod('all');
    setSort('latest');
    setPage(1);
    setOpenMenu(null);
  }

  function deleteItem(item) {
    if (activeCategory === 'individual') setRiskReports(current => current.filter(risk => risk.id !== item.id));
    else setReports(current => current.filter(report => report.id !== item.id));
    setOpenMenu(null);
  }

  async function downloadReport(report) {
    const [{ pdf }, { ReportPdfDocument }, { buildReportPdfData, reportPdfFileName }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./components/reports/ReportPdfDocument'),
      import('./data/reportPdfMock'),
    ]);
    const data = buildReportPdfData(report);
    const blob = await pdf(<ReportPdfDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = reportPdfFileName(report);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function downloadIndividualReport(risk) {
    const [{ pdf }, { IndividualRiskPdfDocument }, { buildIndividualRiskPdfData, individualRiskPdfFileName }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./components/reports/IndividualRiskPdfDocument'),
      import('./data/individualReportPdfMock'),
    ]);
    const data = buildIndividualRiskPdfData(risk);
    const blob = await pdf(<IndividualRiskPdfDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = individualRiskPdfFileName(risk);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadItem(item) {
    if (activeCategory === 'summary') return downloadReport(item);
    return downloadIndividualReport(item);
  }

  const tabs = [
    { value: 'summary', label: '종합 보고서' },
    { value: 'individual', label: '개별 보고서' },
  ];

  function changeCategory(category) {
    setActiveCategory(category);
    const url = new URL(window.location.href);
    if (category === 'summary') url.searchParams.set('tab', 'summary');
    else url.searchParams.delete('tab');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
    setTypeFilter('all');
    setQuery('');
    setPeriod('all');
    setSort('latest');
    setPage(1);
    setOpenMenu(null);
  }

  function renderManagement(item, index, displayName) {
    return (
      <div className="flex items-center justify-center gap-2">
        <button className="grid h-9 w-9 place-items-center rounded-lg text-app-text transition-colors hover:bg-[#14303f]" type="button" aria-label={`${displayName} 다운로드`} title="다운로드" onClick={event => { event.stopPropagation(); void downloadItem(item); }}><AppIcon name="download" className="h-[22px] w-[22px]" /></button>
        <div className="relative" data-report-menu>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-app-text transition-colors hover:bg-[#14303f]" type="button" aria-label={`${displayName} 관리 메뉴`} aria-haspopup="menu" aria-expanded={openMenu === item.id} onClick={event => { event.stopPropagation(); setOpenMenu(current => current === item.id ? null : item.id); }}><AppIcon name="more" className="h-5 w-5" /></button>
          {openMenu === item.id && (
            <div className={`absolute right-0 z-20 w-32 overflow-hidden rounded-lg border border-app-border-strong bg-[#102632] py-1 shadow-xl ${index >= pageReports.length - 2 ? 'bottom-10' : 'top-10'}`} role="menu" onClick={event => event.stopPropagation()}>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-app-text-soft hover:bg-[#183542] hover:text-white" type="button" role="menuitem" onClick={() => duplicateItem(item)}><AppIcon name="copy" className="h-4 w-4" />복제</button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-app-danger hover:bg-[#30212d]" type="button" role="menuitem" onClick={() => deleteItem(item)}><AppIcon name="trash" className="h-4 w-4" />삭제</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="w-full min-w-0 pb-1" style={{ maxWidth: 'calc(100vw - 40px)' }} aria-labelledby="reports-title">
      <div className="mb-2 flex min-h-[48px] items-start justify-between gap-4">
        <h2 id="reports-title" className="text-[28px] font-bold tracking-[-.7px] text-app-text">AI 보고서</h2>
        {/*}
        <button className="flex h-[48px] shrink-0 items-center gap-2 rounded-lg bg-app-accent px-6 text-[14px] font-bold text-[#071823] transition-colors hover:bg-[#ff982f]" type="button" onClick={() => setCreateOpen(true)}>
          <AppIcon name="plus" className="h-5 w-5" strokeWidth={2} />
          보고서 생성
        </button>
        */}
      </div>

      <div className="mb-[15px] flex gap-1 border-b border-app-border-soft" role="tablist" aria-label="보고서 분류">
        {tabs.map(tab => (
          <button
            key={tab.value}
            className={`relative min-w-[132px] px-5 py-[15px] text-[16px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[3px] ${activeCategory === tab.value ? 'text-app-accent after:bg-app-accent' : 'text-app-text-soft after:bg-transparent hover:text-white'}`}
            type="button"
            role="tab"
            aria-selected={activeCategory === tab.value}
            onClick={() => changeCategory(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border border-app-border bg-[#071b27] p-[14px] md:grid-cols-2 xl:grid-cols-[minmax(280px,2fr)_minmax(170px,.8fr)_minmax(210px,1fr)_minmax(190px,.9fr)]">
        <label className="relative block min-w-0">
          <span className="sr-only">보고서 검색</span>
          <AppIcon name="search" className="pointer-events-none absolute top-1/2 left-4 h-[25px] w-[25px] -translate-y-1/2 text-app-text-soft" />
          <input className="h-[48px] w-full rounded-lg border border-app-border bg-[#071b27] pr-4 pl-[53px] text-[15px] text-app-text outline-none transition-colors placeholder:text-[#6f8796] hover:border-app-border-hover focus:border-app-accent" type="search" placeholder={activeCategory === 'summary' ? '보고서명 또는 기간 검색' : '위험 내용 또는 발견 위치 검색'} value={query} onChange={event => resetPage(setQuery)(event.target.value)} />
        </label>
        <SelectField label={activeCategory === 'summary' ? '보고서 유형' : '위험 유형'} value={typeFilter} onChange={event => resetPage(setTypeFilter)(event.target.value)}>
          {activeCategory === 'summary' ? (
            <>
              <option value="all">전체 유형</option>
              <option value="regular">정기 보고서</option>
              <option value="adHoc">수시 보고서</option>
            </>
          ) : (
            <>
              <option value="all">전체 위험 유형</option>
              {riskTypes.map(riskType => <option key={riskType} value={riskType}>{riskType}</option>)}
            </>
          )}
        </SelectField>
        <SelectField label="생성 기간" icon="calendar" value={period} onChange={event => resetPage(setPeriod)(event.target.value)}>
          <option value="all">전체 생성 기간</option>
          {periods.map(value => {
            const [year, month] = value.split('-');
            return <option key={value} value={value}>{year}년 {Number(month)}월</option>;
          })}
        </SelectField>
        <SelectField label="정렬" icon="sort" value={sort} onChange={event => resetPage(setSort)(event.target.value)}>
          <option value="latest">최신 생성순</option>
          <option value="oldest">오래된 생성순</option>
          <option value="name">{activeCategory === 'summary' ? '보고서명순' : '위험 내용순'}</option>
          <option value="risk">{activeCategory === 'summary' ? '포함 위험 많은순' : '위험 등급 높은순'}</option>
        </SelectField>
      </div>

      <p className="mt-[25px] mb-2 text-[22px] font-bold tracking-[-.4px] text-app-text">
        {activeCategory === 'summary' ? '종합 보고서' : '개별 보고서'}
        <strong className="ml-2 text-[24px] text-app-accent">{filteredReports.length}</strong><span className="ml-1 font-normal text-[#79a7c0]">건</span>
      </p>

      <div className="overflow-x-auto rounded-xl border border-app-border">
        <table className="w-full min-w-[1080px] table-fixed border-collapse text-left text-[15px]">
          {activeCategory === 'summary' ? (
            <colgroup>
              <col className="w-[31%]" /><col className="w-[10%]" /><col className="w-[18%]" /><col className="w-[9%]" /><col className="w-[15%]" /><col className="w-[11%]" /><col className="w-[11%]" />
            </colgroup>
          ) : (
            <colgroup>
              <col className="w-[24%]" /><col className="w-[21%]" /><col className="w-[11%]" /><col className="w-[11%]" /><col className="w-[11%]" /><col className="w-[13%]" /><col className="w-[9%]" />
            </colgroup>
          )}
          <thead className="bg-[#0a2230] text-app-text-soft">
            <tr className="h-[57px]">
              {(activeCategory === 'summary'
                ? ['보고서명', '보고서 유형', '분석 기간', '포함 위험', '생성일', '생성 상태', '관리']
                : ['위험 내용', '발견 위치', '위험 유형', '위험 등급', '생성 상태', '생성일자', '관리']
              ).map(label => <th key={label} className="border-r border-app-border-soft px-5 font-semibold last:border-r-0">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {activeCategory === 'summary' ? pageReports.map((report, index) => (
              <tr key={report.id} className="h-[65px] cursor-pointer border-t border-app-border-soft bg-[#061b26] text-app-text-soft transition-colors hover:bg-[#09222f] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-app-accent" tabIndex="0" role="link" aria-label={`${report.name} 상세 보기`} onClick={() => navigate(`/reports/${report.id}`, { state: { report } })} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/reports/${report.id}`, { state: { report } }); } }}>
                <td className="truncate border-r border-app-border-soft px-5 font-medium text-app-text" title={report.name}>{report.name}</td>
                <td className="border-r border-app-border-soft px-5"><span className={`inline-flex min-w-[62px] justify-center rounded-md px-3 py-1.5 font-bold ${TYPE_META[report.type].tone}`}>{TYPE_META[report.type].label}</span></td>
                <td className="whitespace-nowrap border-r border-app-border-soft px-5">{displayDate(report.analysisStart)} ~ {displayDate(report.analysisEnd)}</td>
                <td className="border-r border-app-border-soft px-5 text-center">{report.riskCount}건</td>
                <td className="whitespace-nowrap border-r border-app-border-soft px-5">{formatDateTime(report.createdAt)}</td>
                <td className="border-r border-app-border-soft px-5 font-semibold text-[#43d9a3]">{report.status}</td>
                <td className="px-4">{renderManagement(report, index, report.name)}</td>
              </tr>
            )) : pageReports.map((risk, index) => (
              <tr key={risk.reportId} className="h-[65px] cursor-pointer border-t border-app-border-soft bg-[#061b26] text-app-text-soft transition-colors hover:bg-[#09222f] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-app-accent" tabIndex="0" role="link" aria-label={`${risk.id} ${risk.riskContent} 상세 보기`} onClick={() => navigate(`/reports/individual/${risk.reportId}`, { state: { risk } })} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/reports/individual/${risk.reportId}`, { state: { risk } }); } }}>
                <td className="border-r border-app-border-soft px-5"><div className="truncate font-medium text-app-text" title={risk.riskContent}>{risk.riskContent}</div><div className="mt-0.5 text-xs text-app-muted">{risk.id}</div></td>
                <td className="truncate border-r border-app-border-soft px-5" title={risk.location}>{risk.location}</td>
                <td className="truncate border-r border-app-border-soft px-5" title={risk.riskType}>{risk.riskType}</td>
                <td className="border-r border-app-border-soft px-5"><span className={`inline-flex min-w-[78px] justify-center rounded-md border px-3 py-1.5 text-[13px] font-bold ${RISK_LEVEL_META[risk.riskLevel]}`}>{risk.riskLevel}</span></td>
                <td className="border-r border-app-border-soft px-5 font-semibold text-[#43d9a3]">{risk.status}</td>
                <td className="whitespace-nowrap border-r border-app-border-soft px-5">{formatDateTime(risk.createdAt)}</td>
                <td className="px-4">{renderManagement(risk, index, `${risk.id} ${risk.riskContent}`)}</td>
              </tr>
            ))}
            {!isLoading && pageReports.length === 0 && (
              <tr className="h-48 border-t border-app-border-soft bg-[#061b26]"><td colSpan="7" className="text-center"><p className="font-medium text-app-text-soft">{loadError || '조건에 맞는 보고서가 없습니다.'}</p>{!loadError && <p className="mt-1 text-sm text-app-muted">검색어나 필터를 변경해 주세요.</p>}</td></tr>
            )}
            {isLoading && activeCategory === 'individual' && (
              <tr className="h-48 border-t border-app-border-soft bg-[#061b26]"><td colSpan="7" className="text-center text-app-muted">보고서 목록을 불러오는 중입니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-[74px] items-center justify-between gap-4 pt-[18px]">
        <p className="text-[17px] text-[#9abbd0]">{start}-{end} / {filteredReports.length}건</p>
        <nav className="flex items-center gap-[7px]" aria-label="보고서 목록 페이지">
          <button className="grid h-[42px] w-[40px] place-items-center rounded-lg border border-app-border text-app-text-soft transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}><AppIcon name="chevronLeft" className="h-5 w-5" /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} className={`h-[42px] min-w-[40px] rounded-lg border px-3 text-[15px] transition-colors ${number === currentPage ? 'border-app-accent bg-[#101e27] text-app-accent' : 'border-app-border text-[#9abbd0] hover:bg-app-hover'}`} type="button" aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}
          <button className="grid h-[42px] w-[40px] place-items-center rounded-lg border border-app-border text-app-text-soft transition-colors hover:bg-app-hover disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="다음 페이지" disabled={currentPage === pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}><AppIcon name="chevronRight" className="h-5 w-5" /></button>
        </nav>
      </div>

      {createOpen && <ReportFormModal onClose={() => setCreateOpen(false)} onCreate={createReport} />}
    </section>
  );
}
