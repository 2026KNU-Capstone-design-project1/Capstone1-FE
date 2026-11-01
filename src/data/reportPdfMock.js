import factoryRiskImage from '../assets/factory-transparent-bg2.png';
import workerRiskImage from '../assets/risk-detail.png';

const RISK_TEMPLATES = [
  {
    title: '안전난간 미설치',
    jobName: '5호기 SCR 10층 AIG 철거작업',
    accidentType: '추락',
    location: 'A구역 · 5호기 SCR 10층',
    severity: 'HIGH',
    status: '미처리',
    firstDetected: '2026.10.08',
    description: '개구부 추락방지 조치가 임시 로프로 설치되어 있어 추락 위험이 존재함.',
    recommendation: '임시 로프를 제거하고 규격에 맞는 안전난간과 발끝막이판을 설치할 것.',
    legalBasis: '산업안전보건기준에 관한 규칙 제43조 (개구부 등의 방호 조치)',
    imageUrl: factoryRiskImage,
    imageWidth: 1639,
    imageHeight: 960,
    bbox: { x: 650, y: 390, width: 410, height: 360, unit: 'pixel' },
  },
  {
    title: '보호구 미착용',
    jobName: 'A구역 설비 정기점검 작업',
    accidentType: '부딪힘',
    location: 'A구역 · 조립라인 02',
    severity: 'MEDIUM',
    status: '처리중',
    firstDetected: '2026.10.12',
    description: '작업자가 안전모를 올바르게 착용하지 않은 상태로 설비 인근에서 작업함.',
    recommendation: '작업 전 보호구 착용 상태를 확인하고 현장 관리자의 순회 점검을 강화할 것.',
    legalBasis: '산업안전보건기준에 관한 규칙 제32조 (보호구의 지급 등)',
    imageUrl: workerRiskImage,
    imageWidth: 134,
    imageHeight: 114,
    bbox: { x: 74, y: 16, width: 44, height: 88, unit: 'pixel' },
  },
  {
    title: '전선 피복 손상',
    jobName: '배전반 주변 배선 정리 작업',
    accidentType: '감전',
    location: 'B구역 · 배전반실',
    severity: 'HIGH',
    status: '미처리',
    firstDetected: '2026.10.15',
    description: '전선 피복이 손상되어 내부 도체가 노출된 상태로 감전 및 화재 위험이 존재함.',
    recommendation: '손상된 전선을 즉시 교체하고 배선 보호 커버와 누전 차단 장치를 점검할 것.',
    legalBasis: '산업안전보건기준에 관한 규칙 제302조 (전기기계·기구의 위험 방지)',
    imageUrl: factoryRiskImage,
    imageWidth: 1639,
    imageHeight: 960,
    bbox: { x: 1080, y: 300, width: 330, height: 290, unit: 'pixel' },
  },
  {
    title: '작업자 출입통제 미준수',
    jobName: '중량물 인양 및 이동 작업',
    accidentType: '끼임',
    location: 'C구역 · 출입구 01',
    severity: 'HIGH',
    status: '처리중',
    firstDetected: '2026.10.18',
    description: '중량물 이동 구간에 작업자 접근이 확인되어 설비와 작업자 간 충돌 위험이 있음.',
    recommendation: '위험 반경에 출입통제선을 설치하고 신호수를 배치하여 작업자 접근을 제한할 것.',
    legalBasis: '산업안전보건기준에 관한 규칙 제20조 (출입의 금지 등)',
    imageUrl: workerRiskImage,
    imageWidth: 134,
    imageHeight: 114,
    bbox: { x: 12, y: 34, width: 62, height: 74, unit: 'pixel' },
  },
];

const AREAS = [
  { label: 'A구역', count: 54, ratio: 42 },
  { label: 'B구역', count: 22, ratio: 17 },
  { label: 'C구역', count: 18, ratio: 14 },
  { label: 'D구역', count: 16, ratio: 13 },
  { label: '기타', count: 18, ratio: 14 },
];

const TYPES = [
  { label: '추락', count: 36, ratio: 28, color: '#ff7619' },
  { label: '끼임', count: 22, ratio: 17, color: '#ff9b4b' },
  { label: '부딪힘', count: 18, ratio: 14, color: '#b8d9f7' },
  { label: '화재·폭발', count: 16, ratio: 13, color: '#88b4e4' },
  { label: '감전', count: 12, ratio: 9, color: '#d8eafb' },
  { label: '기타', count: 24, ratio: 19, color: '#567da8' },
];

function dateOnly(value) {
  return value?.split(' ')[0]?.replaceAll('-', '.') ?? '-';
}

function createRisks(count) {
  return Array.from({ length: count }, (_, index) => {
    const template = RISK_TEMPLATES[index % RISK_TEMPLATES.length];
    return {
      ...template,
      id: `RISK-${String(index + 1).padStart(3, '0')}`,
      sequence: index + 1,
    };
  });
}

/**
 * Temporary adapter for the report API response.
 * Replace this function body with the backend response mapping later.
 * A risk image may be a local asset or signed URL. Pixel bboxes require
 * imageWidth/imageHeight; ratio bboxes may use unit: 'ratio'.
 */
export function buildReportPdfData(report) {
  const detailRiskCount = Math.max(1, report.riskCount ?? 8);
  const totalRiskCount = 128;
  const highRiskCount = 24;
  const unresolvedCount = 37;

  return {
    id: report.id,
    title: report.name,
    siteName: 'Riverside Manufacturing Site',
    analysisStart: dateOnly(report.analysisStart),
    analysisEnd: dateOnly(report.analysisEnd),
    createdAt: dateOnly(report.createdAt),
    totalRiskCount,
    highRiskCount,
    unresolvedCount,
    summary: {
      metrics: [
        { label: '전체 위험 건수', value: `${totalRiskCount}건`, change: '전월 대비 12% 증가' },
        { label: '고위험 건수', value: `${highRiskCount}건`, change: '전월 대비 33% 증가' },
        { label: '미해결 건수', value: `${unresolvedCount}건`, change: '전월 대비 19% 증가' },
        { label: '주요 위험 유형', value: '추락', subtext: '전체의 28% 차지' },
      ],
      insights: [
        { label: '위험 집중 구역', value: 'A구역', detail: '전체 위험의 약 42%가\nA구역에서 탐지됨' },
        { label: '가장 빈번한 위험 유형', value: '추락', detail: '전체 위험 중 가장 높은\n비중을 차지' },
        { label: '반복 탐지 위험', value: '안전난간 미설치', detail: '동일 위험 유형의\n반복적인 탐지 확인' },
        { label: '집중 관리 필요 사항', value: 'A구역 고소작업', detail: '추락 방지시설 및 작업 환경\n집중 점검 권고' },
      ],
      priorityRisks: [
        { id: 'RISK-001', content: '안전난간 미설치', location: 'A구역 · 작업발판 03', severity: 'HIGH', status: '미처리' },
        { id: 'RISK-009', content: '전선 노출', location: 'C구역 · 전기설비 04', severity: 'HIGH', status: '처리중' },
        { id: 'RISK-017', content: '작업자 출입통제 미준수', location: 'A구역 · 출입구 01', severity: 'HIGH', status: '미처리' },
      ],
      managementComment: 'A구역 고소작업 구간의 추락 방지시설 점검을 최우선으로 권고합니다. 반복 탐지된 안전난간 미설치 위험의 조치 여부를 확인하고, 고위험 미해결 항목에 대한 현장 점검 및 후속 조치를 강화할 필요가 있습니다.',
    },
    analysis: {
      areas: AREAS,
      areaNarrative: {
        panelTitle: '주요 분석 및 관리 권고',
        items: [
          {
            id: 'concentration',
            title: '위험 집중 구역',
            description: 'A구역에 54건(42%)이 집중됐고, 이 중 27건이 추락 위험입니다. 작업발판과 고소작업 구간에 탐지가 편중됐습니다.',
          },
          {
            id: 'characteristics',
            title: '주요 위험 특성',
            description: 'A구역 추락 위험 27건 중 HIGH 12건, 미해결 15건입니다. 안전난간 미설치는 고유 위험 이벤트 4건에서 총 9회 탐지됐습니다.',
          },
          {
            id: 'recommendation',
            title: '관리 권고',
            description: 'A구역 작업발판 03과 5호기 SCR 10층을 우선 점검하고, HIGH·미해결 항목의 안전난간 보강과 조치 완료 확인을 선행해야 합니다.',
          },
        ],
      },
      types: TYPES,
      typeNarrative: {
        panelTitle: '주요 분석 및 관리 권고',
        items: [
          {
            id: 'primary-type',
            title: '주요 위험 유형',
            description: '추락은 36건(28%)으로 가장 많고, 27건이 A구역에 집중됐습니다. 작업발판과 고소작업 지점의 안전시설 미흡 항목이 주요 관리 대상입니다.',
          },
          {
            id: 'severity',
            title: '위험 특성 및 심각도',
            description: '추락 36건 중 HIGH 14건, 미해결 17건입니다. 감전은 12건이지만 HIGH 6건·미해결 7건이며, 이 중 5건은 두 조건이 동시에 확인됐습니다.',
          },
          {
            id: 'recommendation',
            title: '개선 권고',
            description: '추락은 미해결 17건의 난간·개구부 조치를 우선 완료하고, 감전은 HIGH·미해결 5건의 배선과 차단장치를 별도 집중점검 대상으로 관리해야 합니다.',
          },
        ],
      },
    },
    risks: createRisks(detailRiskCount),
  };
}

export function reportPdfFileName(report) {
  const safeTitle = report.name.replace(/[\\/:*?"<>|]/g, '_');
  return `${safeTitle}.pdf`;
}

export function reportPdfPageCount(data) {
  return 3 + Math.ceil(data.risks.length / 2);
}
