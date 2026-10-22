import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import { FailureIcon, FilterSelect, FolderIcon, UploadIcon } from './VideoManagementPage';
import alertNoPpeImage from './assets/alert-no-ppe.png';
import alertSpillImage from './assets/alert-spill.png';
import riskDetailImage from './assets/risk-detail.png';
import { videoFoldersMock } from './data/videoFoldersMock';
import { getVideoItems } from './data/videoItemsMock';

const thumbnails = [riskDetailImage, alertNoPpeImage, alertSpillImage];

const analysisLabels = {
  complete: '분석 완료',
  processing: '분석 중',
  failed: '분석 실패',
};

const analysisTones = {
  complete: 'text-[#43d596]',
  processing: 'text-[#4ba3f5]',
  failed: 'text-app-danger',
};

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5 translate-x-px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m8.5 5 10 7-10 7V5Z" />
    </svg>
  );
}

function VideoCard({ video }) {
  const hasRisk = video.riskIssueCount > 0;

  return (
    <article className="overflow-hidden rounded-xl border border-app-border bg-[#071c28] transition-colors hover:border-app-border-hover">
      <div className="relative h-[118px] overflow-hidden bg-[#102733]">
        <img
          className="h-full w-full object-cover opacity-75 transition-transform duration-300 hover:scale-[1.03]"
          src={thumbnails[video.thumbnailIndex]}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03121c]/55 via-transparent to-black/10" />
        <button className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-[#10222d]/65 text-white transition-colors hover:bg-app-accent hover:text-[#071823]" type="button" aria-label={`${video.fileName} 재생`}>
          <PlayIcon />
        </button>
        <button className="absolute top-2 right-2 grid h-7 w-8 place-items-center rounded-md bg-[#071823]/80 text-white" type="button" aria-label={`${video.fileName} 메뉴`}>
          <AppIcon name="more" className="h-5 w-5" />
        </button>
        <span className="absolute right-2 bottom-2 rounded bg-[#071823]/85 px-2 py-1 text-[11px] font-medium text-white">{formatDuration(video.durationSeconds)}</span>
      </div>

      <div className="px-3.5 pt-2.5 pb-3">
        <h3 className="truncate text-[14px] font-bold text-app-text" title={video.fileName}>{video.fileName}</h3>
        <dl className="mt-2 grid grid-cols-[76px_1fr] gap-y-1 text-[12px]">
          <dt className="text-app-muted">구역</dt><dd className="text-app-text-soft">{video.area}</dd>
          <dt className="text-app-muted">촬영 시각</dt><dd className="text-app-text-soft">{video.recordedAt.replaceAll('-', '.')}</dd>
          <dt className="text-app-muted">분석 상태</dt><dd className={analysisTones[video.analysisStatus]}>{analysisLabels[video.analysisStatus]}</dd>
        </dl>

        <div className="mt-2.5 flex min-h-[35px] items-center border-t border-app-border-soft pt-2.5 text-[12px]">
          {video.analysisStatus === 'processing' && <p className="text-app-text-soft">위험 이슈 집계 전</p>}
          {video.analysisStatus === 'failed' && (
            <p className="flex w-full items-center gap-2 rounded-md bg-[#30212d] px-2.5 py-2 text-app-danger">
              <FailureIcon className="h-4 w-4 shrink-0" />
              분석 실패 · 재분석 필요
            </p>
          )}
          {video.analysisStatus === 'complete' && !hasRisk && <p className="text-app-text-soft">위험 없음</p>}
          {video.analysisStatus === 'complete' && hasRisk && (
            <p className="flex flex-wrap items-center gap-x-2 text-app-text-soft">
              <span>위험 {video.riskIssueCount}건</span><span className="text-app-muted">·</span>
              <span className="text-app-danger">고위험 {video.highRiskCount}건</span><span className="text-app-muted">·</span>
              <span className={video.unresolvedRiskCount > 0 ? 'text-[#4ba3f5]' : 'text-[#43d596]'}>미해결 {video.unresolvedRiskCount}건</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function VideoFolderPage() {
  const { date } = useParams();
  const folder = videoFoldersMock.find(item => item.date === date);
  const [area, setArea] = useState('all');
  const [risk, setRisk] = useState('all');
  const [analysis, setAnalysis] = useState('all');
  const [sort, setSort] = useState('latest');

  const videos = useMemo(() => {
    if (!folder) return [];
    return getVideoItems(folder.date)
      .filter(video => area === 'all' || video.area === area)
      .filter(video => {
        if (risk === 'unresolved') return video.unresolvedRiskCount > 0;
        if (risk === 'resolved') return video.analysisStatus === 'complete' && video.unresolvedRiskCount === 0;
        return true;
      })
      .filter(video => analysis === 'all' || video.analysisStatus === analysis)
      .sort((a, b) => sort === 'latest' ? b.recordedAt.localeCompare(a.recordedAt) : a.recordedAt.localeCompare(b.recordedAt));
  }, [analysis, area, folder, risk, sort]);

  if (!folder) return <Navigate to="/videos" replace />;

  return (
    <section className="flex h-[calc(100dvh-125px)] min-h-[540px] flex-col overflow-hidden" aria-labelledby="video-folder-title">
      <div className="shrink-0 pb-4">
        <div className="flex min-h-[48px] items-start justify-between gap-4">
          <h2 id="video-folder-title" className="text-[28px] font-bold tracking-[-.7px] text-app-text">
            <Link className="rounded text-inherit" to="/videos" aria-label="영상 관리 폴더 목록으로 이동">
              영상 관리
            </Link>
          </h2>
          <button className="flex h-[48px] shrink-0 items-center gap-2 rounded-lg bg-app-accent px-6 text-[14px] font-bold text-[#071823] transition-colors hover:bg-[#ff982f]" type="button">
            <UploadIcon className="h-5 w-5" />
            영상 업로드
          </button>
        </div>

        <nav className="mt-1 flex items-center gap-1.5 text-[13px]" aria-label="영상 폴더 경로">
          <Link className="text-app-text-soft transition-colors hover:text-app-accent" to="/videos">영상</Link>
          <AppIcon name="chevronRight" className="h-4 w-4 text-app-muted" />
          <span className="font-semibold text-app-text">{folder.date.replaceAll('-', '.')}</span>
        </nav>

        <div className="mt-3 flex min-h-[78px] items-center gap-5 rounded-xl border border-app-border bg-[#071c28] px-6">
          <FolderIcon className="h-11 w-11 shrink-0" />
          <div>
            <h3 className="text-[19px] font-bold text-app-text">{folder.date.replaceAll('-', '.')}</h3>
            <p className="mt-0.5 text-[13px] text-app-text-soft">영상 {folder.videoCount}개 <span className="mx-1 text-app-muted">·</span> 분석 완료 {folder.analyzedCount}/{folder.videoCount}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect label="구역" value={area} onChange={event => setArea(event.target.value)} icon="calendar">
            <option value="all">전체 구역</option>
            <option value="A구역">A구역</option>
            <option value="B구역">B구역</option>
            <option value="C구역">C구역</option>
          </FilterSelect>
          <FilterSelect label="미해결 위험 여부" value={risk} onChange={event => setRisk(event.target.value)}>
            <option value="all">미해결 위험: 전체</option>
            <option value="unresolved">미해결 위험 있음</option>
            <option value="resolved">미해결 위험 없음</option>
          </FilterSelect>
          <FilterSelect label="분석 상태" value={analysis} onChange={event => setAnalysis(event.target.value)}>
            <option value="all">분석 상태: 전체</option>
            <option value="complete">분석 완료</option>
            <option value="processing">분석 중</option>
            <option value="failed">분석 실패</option>
          </FilterSelect>
          <FilterSelect label="정렬" value={sort} onChange={event => setSort(event.target.value)} icon="sort">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </FilterSelect>
        </div>
      </div>

      <div className="video-folder-scrollbar min-h-0 flex-1 overflow-y-auto pr-1" aria-label={`${folder.date} 영상 목록`}>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 pb-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {videos.map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-app-border text-center">
            <div>
              <p className="font-medium text-app-text-soft">조건에 맞는 영상이 없습니다.</p>
              <p className="mt-1 text-sm text-app-muted">필터 조건을 변경해 주세요.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
