import { authorizedRequest } from './auth';

const STATUS_LABELS = {
  OPEN: '미처리',
  IN_PROGRESS: '처리중',
  RESOLVED: '처리 완료',
};

function toRiskItem(risk) {
  return {
    id: risk.id,
    displayCode: `RISK-${String(risk.id).padStart(3, '0')}`,
    content: risk.hazard ?? '-',
    type: risk.riskType ?? '-',
    location: risk.location ?? '-',
    severity: risk.riskLevel ?? '-',
    status: STATUS_LABELS[risk.status] ?? risk.status ?? '-',
    detectedAt: risk.createdAt,
    resolvedAt: risk.resolvedAt,
    videos: 1,
    assignee: risk.managerName ?? '미배정',
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
