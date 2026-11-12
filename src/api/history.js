import { authorizedRequest } from './auth';

const STATUS_LABELS = {
  OPEN: '미처리',
  IN_PROGRESS: '처리중',
  RESOLVED: '해결완료',
};

const STATUS_TONES = {
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
};

function toCount(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function toEvent(event) {
  const cycle = Math.max(1, toCount(event.cycle));
  const isDetection = event.eventType === 'DETECTED';

  return {
    id: event.id,
    at: event.changedAt,
    description: isDetection
      ? (cycle === 1 ? '최초 위험 발견' : '위험 재탐지')
      : '처리 상태 변경',
    badge: isDetection
      ? `${cycle}차 탐지`
      : (STATUS_LABELS[event.status] ?? event.status ?? '-'),
    tone: STATUS_TONES[event.status],
  };
}

function toHistoryItem(history) {
  const riskId = history.riskId;
  const events = Array.isArray(history.events)
    ? history.events
      .map(toEvent)
      .sort((a, b) => {
        const changedAtOrder = Date.parse(b.at) - Date.parse(a.at);
        return changedAtOrder || Number(b.id ?? 0) - Number(a.id ?? 0);
      })
    : [];

  return {
    id: riskId,
    displayCode: `RISK-${String(riskId).padStart(3, '0')}`,
    content: history.hazard ?? '-',
    riskType: history.riskType ?? '-',
    area: history.zoneName ?? '-',
    location: history.facilityName ?? '-',
    firstDetected: history.firstDetectedDt,
    lastDetected: history.lastDetectedDt,
    detectionCount: toCount(history.detectionCount),
    status: STATUS_LABELS[history.status] ?? history.status ?? '-',
    events,
  };
}

export async function getHistory(options = {}) {
  const response = await authorizedRequest('/api/history', options);

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('위험 이력 응답 형식이 올바르지 않습니다.');
  }

  if (!Array.isArray(response.histories)) {
    throw new Error('위험 이력 목록 응답 형식이 올바르지 않습니다.');
  }

  return {
    repeatedDetectionCount: toCount(response.repeatedDetectionCount),
    longTermUnresolvedCount: toCount(response.longTermUnresolvedCount),
    redetectedAfterActionCount: toCount(response.redetectedAfterActionCount),
    histories: response.histories.map(toHistoryItem),
  };
}

export async function getHistoryAiAnalysis(options = {}) {
  const response = await authorizedRequest('/api/history/ai-analysis', {
    ...options,
    method: 'POST',
  });

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('AI 이력 분석 응답 형식이 올바르지 않습니다.');
  }

  if (typeof response.aiAnalysis !== 'string' || !response.aiAnalysis.trim()) {
    throw new Error('AI 이력 분석 결과가 없습니다.');
  }

  return response.aiAnalysis.trim();
}
