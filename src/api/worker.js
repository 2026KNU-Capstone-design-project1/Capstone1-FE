import { authorizedRequest } from './auth';

const STATUS_LABELS = {
  OPEN: '미처리',
  IN_PROGRESS: '처리 중',
  RESOLVED: '완료',
};

function toCount(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function toRiskSummary(risk) {
  if (!risk || typeof risk !== 'object' || Array.isArray(risk)) return null;

  const location = [risk.zoneName, risk.facilityName]
    .filter(value => typeof value === 'string' && value.trim())
    .map(value => value.trim())
    .join(' · ');

  return {
    id: risk.id,
    title: risk.hazard ?? '-',
    location: location || '-',
    severity: risk.level ?? risk.riskLevel ?? 'LOW',
    status: STATUS_LABELS[risk.status] ?? risk.status ?? '-',
    rawStatus: risk.status,
    engName: risk.engName
      ?? risk.eng_name
      ?? risk.facilityEngName
      ?? risk.facility?.engName
      ?? risk.facility?.eng_name,
    facilityName: risk.facilityName ?? risk.facility?.name ?? '',
    detectedAt: risk.detectedAt ?? risk.createdAt ?? '-',
    description: risk.description ?? risk.hazard ?? '-',
    guide: risk.guide ?? '현장 안전 기준에 따라 위험 요소를 확인하고 조치해 주세요.',
  };
}

export async function getWorkerHome(options = {}) {
  const response = await authorizedRequest('/api/worker', options);

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('작업자 홈 응답 형식이 올바르지 않습니다.');
  }

  if (!Array.isArray(response.risks)) {
    throw new Error('담당 위험 목록 응답 형식이 올바르지 않습니다.');
  }

  return {
    openedCount: toCount(response.openedCount),
    inProgressCount: toCount(response.inProgressCount),
    completedCount: toCount(response.completedCount),
    mostPriorRisk: toRiskSummary(response.mostPriorRisk),
    risks: response.risks.map(toRiskSummary).filter(Boolean),
    userName: typeof response.userName === 'string' ? response.userName.trim() : '',
  };
}
