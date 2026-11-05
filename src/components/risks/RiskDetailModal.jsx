import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import riskDetailImage from '../../assets/construction-site-pipe.jpg';
import { dashboardMock } from '../../data/dashboardMock';
import { formatDateTime } from '../../utils/dateTime';
import AppIcon from '../AppIcon';

const severityTone = {
  HIGH: 'text-app-danger',
  MEDIUM: 'text-[#ff7770]',
  LOW: 'text-app-text-soft',
};

const statusTone = {
  미처리: 'text-app-danger',
  처리중: 'text-app-muted',
  '처리 완료': 'text-[#28d28b]',
};

const STATUS_OPTIONS = ['미처리', '처리중', '처리 완료'];

function getRiskType(content) {
  if (/난간|추락|계단|고소/.test(content)) return '추락 위험';
  if (/전선|분전반|전기/.test(content)) return '전기 위험';
  if (/가스|소화기|용접|화재/.test(content)) return '화재 위험';
  if (/보호구|안전모/.test(content)) return '보호구 미착용';
  if (/바닥|누수|미끄럼/.test(content)) return '미끄럼 위험';
  return '작업 안전 위험';
}

function makeFallbackHistory(risk) {
  const history = [{ detectedAt: risk.detectedAt, description: '위험 발견' }];
  if (risk.resolvedAt) {
    history.push({
      detectedAt: risk.resolvedAt,
      description: `해결 완료${risk.assignee !== '미배정' ? ` · ${risk.assignee}` : ''}`,
    });
  }
  return history;
}

function getBoundingBoxStyle(bbox) {
  if (!bbox) return null;

  const values = [bbox.x, bbox.y, bbox.width, bbox.height].map(Number);
  if (values.some(value => !Number.isFinite(value) || value < 0 || value > 1)) return null;

  const [x, y, width, height] = values;
  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${width * 100}%`,
    height: `${height * 100}%`,
  };
}

export default function RiskDetailModal({ risk, detailError = '', onClose }) {
  const closeButtonRef = useRef(null);
  const statusControlRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState(risk.status);
  const [pendingStatus, setPendingStatus] = useState(risk.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const history = useMemo(
    () => risk.history?.length ? risk.history : makeFallbackHistory(risk),
    [risk],
  );
  const originalVideoUrl = risk.relatedVideos?.[0]?.videoUrl;
  const relatedVideoCount = risk.relatedVideos?.length ?? 0;
  const boundingBoxStyle = getBoundingBoxStyle(risk.bbox);
  const detailedLocation = [risk.zoneName, risk.facilityName, risk.locationDescription]
    .filter(Boolean)
    .join(' · ') || risk.location;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (!statusMenuOpen) return undefined;

    function closeStatusMenu(event) {
      if (!statusControlRef.current?.contains(event.target)) setStatusMenuOpen(false);
    }

    document.addEventListener('pointerdown', closeStatusMenu);
    return () => document.removeEventListener('pointerdown', closeStatusMenu);
  }, [statusMenuOpen]);

  function handleStatusButton() {
    if (statusMenuOpen) {
      setCurrentStatus(pendingStatus);
      setStatusMenuOpen(false);
      return;
    }

    setPendingStatus(currentStatus);
    setStatusMenuOpen(true);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-6"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[850px] flex-col overflow-hidden rounded-xl border border-app-border bg-[#061b26] text-app-text shadow-2xl sm:max-h-[calc(100dvh-48px)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-detail-title"
      >
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-app-border-soft px-7">
          <h2 id="risk-detail-title" className="text-[22px] font-bold tracking-[-.4px]">위험 상세</h2>
          <button ref={closeButtonRef} className="grid h-10 w-10 place-items-center rounded-lg text-[#9eb4c2] transition-colors hover:bg-app-hover hover:text-white" type="button" onClick={onClose} aria-label="위험 상세 닫기">
            <AppIcon name="close" className="h-7 w-7" strokeWidth={1.35} />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-7 pt-5 pb-5 [scrollbar-color:#375365_transparent]">
          {detailError && (
            <div className="mb-4 rounded-lg border border-app-danger/50 bg-app-danger/10 px-4 py-3 text-[14px] text-app-danger" role="alert">
              상세 API 연결 실패: {detailError}
            </div>
          )}
          <h3 className="text-[24px] font-bold tracking-[-.4px]">{risk.content}</h3>

          <div className="mt-3 flex flex-wrap items-center gap-y-2 text-[15px]">
            <p className="pr-7 text-app-muted">위험 유형: <strong className="ml-3 font-semibold text-app-text">{risk.type ?? getRiskType(risk.content)}</strong></p>
            <p className="border-l border-app-border px-7 text-app-muted">위험 등급: <strong className={`ml-3 font-bold ${severityTone[risk.severity]}`}>{risk.severity}</strong></p>
            <p className="border-l border-app-border pl-7 text-app-muted">처리 상태: <strong className={`ml-3 font-bold ${statusTone[currentStatus]}`}>{currentStatus}</strong></p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,1fr)]">
            <div className="min-w-0">
              <div className="relative h-[288px] w-full overflow-hidden rounded-lg border border-app-border">
                <img className="h-full w-full object-cover" src={risk.image ?? riskDetailImage} alt={`${risk.content} 감지 화면`} />
                {boundingBoxStyle && (
                  <span
                    className="pointer-events-none absolute border-[3px] border-[#ff3838] shadow-[0_0_0_1px_rgba(0,0,0,.45),0_0_12px_rgba(255,56,56,.55)]"
                    style={boundingBoxStyle}
                    aria-hidden="true"
                  />
                )}
              </div>
              <a
                className={`mt-3 flex h-10 w-fit min-w-[172px] items-center justify-center gap-3 rounded-lg border border-[#698797] px-5 text-[14px] font-medium text-app-text transition-colors ${originalVideoUrl ? 'hover:bg-app-hover' : 'pointer-events-none opacity-45'}`}
                href={originalVideoUrl || undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!originalVideoUrl}
              >
                <AppIcon name="play" className="h-5 w-5" />
                원본 영상 보기
              </a>
            </div>

            <dl className="grid content-start grid-cols-[60px_minmax(0,1fr)] gap-x-4 gap-y-5 pt-1 text-[15px]">
              <dt className="text-app-muted">현장:</dt><dd className="break-words text-app-text">{risk.siteName ?? risk.site ?? dashboardMock.site.name}</dd>
              <dt className="text-app-muted">위치:</dt><dd>{detailedLocation}</dd>
              <dt className="text-app-muted">발견일시:</dt><dd className="whitespace-nowrap">{formatDateTime(risk.detectedAt)}</dd>
              <dt className="text-app-muted">해결일시:</dt><dd className="whitespace-nowrap">{formatDateTime(risk.resolvedAt)}</dd>
              <dt className="text-app-muted">관련 영상:</dt><dd>{relatedVideoCount}개</dd>
              <dt className="text-app-muted">담당자:</dt><dd>{risk.assignee}</dd>
            </dl>
          </div>

          <section className="mt-6" aria-labelledby="risk-history-title">
            <h4 id="risk-history-title" className="mb-3 text-[19px] font-bold">처리 이력</h4>
            <div className="overflow-hidden rounded-lg border border-app-border">
              {history.map((item, index) => (
                <div key={`${item.detectedAt}-${index}`} className="grid min-h-[46px] grid-cols-[200px_minmax(0,1fr)] items-center border-b border-app-border-soft px-4 text-[14px] last:border-b-0 max-sm:grid-cols-1 max-sm:gap-1 max-sm:py-3">
                  <time className="text-[#9eb4c2]">{formatDateTime(item.detectedAt)}</time>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-5 flex justify-end gap-3">
            <button className="h-11 rounded-lg border border-[#829ba9] px-6 text-[14px] font-medium transition-colors hover:bg-app-hover" type="button">담당자 지정</button>
            <div ref={statusControlRef} className="relative w-[141px]">
              {statusMenuOpen && (
                <div className="absolute right-0 bottom-[calc(100%+8px)] z-10 w-full overflow-hidden rounded-lg border border-app-border-strong bg-[#0a2230] p-1 shadow-2xl" role="listbox" aria-label="처리 상태 선택">
                  {STATUS_OPTIONS.map(option => (
                    <button
                      key={option}
                      className={`flex h-10 w-full items-center justify-between rounded-md px-3 text-left text-[14px] transition-colors ${pendingStatus === option ? 'bg-app-active-subtle text-app-accent' : 'text-app-text hover:bg-app-hover'}`}
                      type="button"
                      role="option"
                      aria-selected={pendingStatus === option}
                      onClick={() => setPendingStatus(option)}
                    >
                      <span>{option}</span>
                      {pendingStatus === option && <AppIcon name="check" className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
              <button
                className="h-11 w-full rounded-lg bg-app-accent px-4 text-[14px] font-bold text-[#071823] transition-colors hover:bg-[#ff982f]"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={statusMenuOpen}
                onClick={handleStatusButton}
              >
                {statusMenuOpen ? '확인' : '처리 상태 변경'}
              </button>
            </div>
          </footer>
        </div>
      </section>
    </div>,
    document.body,
  );
}
