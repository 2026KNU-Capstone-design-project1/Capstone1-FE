import { authorizedRequest } from './auth';

const STATUS_LABELS = {
  OPEN: '미처리',
  IN_PROGRESS: '처리중',
  RESOLVED: '처리 완료',
};

const HISTORY_STATUS_LABELS = {
  OPEN: '위험 발견',
  IN_PROGRESS: '처리 중',
  RESOLVED: '해결 완료',
};

function joinLocation(risk) {
  const locationParts = [risk.zoneName, risk.facilityName, risk.location]
    .filter(part => typeof part === 'string' && part.trim())
    .map(part => part.trim());

  return locationParts.length ? locationParts.join(' · ') : '-';
}

function toHistoryItem(item, managerName) {
  const statusLabel = HISTORY_STATUS_LABELS[item.status] ?? item.status ?? '-';
  const showManager = item.status === 'IN_PROGRESS' || item.status === 'RESOLVED';

  return {
    id: item.id,
    detectedAt: item.changedAt,
    description: `${statusLabel}${showManager && managerName ? ` · ${managerName}` : ''}`,
  };
}

export function toRiskItem(risk) {
  return {
    id: risk.id,
    displayCode: `RISK-${String(risk.id).padStart(3, '0')}`,
    content: risk.hazard ?? '-',
    type: risk.riskType ?? '-',
    location: joinLocation(risk),
    zoneName: risk.zoneName ?? '',
    facilityName: risk.facilityName ?? '',
    locationDescription: risk.location ?? '',
    severity: risk.riskLevel ?? '-',
    status: STATUS_LABELS[risk.status] ?? risk.status ?? '-',
    detectedAt: risk.createdAt,
    resolvedAt: risk.resolvedAt,
    videos: Array.isArray(risk.relatedVideos) ? risk.relatedVideos.length : 0,
    assignee: risk.managerName ?? '미배정',
    site: risk.siteName ?? '-',
    siteName: risk.siteName ?? '-',
    image: risk.imageUrl,
    bbox: risk.bbox ?? null,
    relatedVideos: Array.isArray(risk.relatedVideos) ? risk.relatedVideos : [],
    history: Array.isArray(risk.history)
      ? risk.history.map(item => toHistoryItem(item, risk.managerName))
      : [],
  };
}

export async function getRisks(options = {}) {
  const response = await authorizedRequest('/api/risks', options);
  const content = Array.isArray(response) ? response : response?.content;

  if (!Array.isArray(content)) {
    throw new Error('위험 목록 응답 형식이 올바르지 않습니다.');
  }

  return content.map(toRiskItem);
}

export async function getRisk(riskId, options = {}) {
  const response = await authorizedRequest(`/api/risks/${encodeURIComponent(riskId)}`, options);
  const risk = response?.data ?? response?.content ?? response;

  if (!risk || typeof risk !== 'object' || Array.isArray(risk)) {
    throw new Error('위험 상세 응답 형식이 올바르지 않습니다.');
  }

  return toRiskItem(risk);
}
