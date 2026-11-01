import factoryRiskImage from '../assets/factory-transparent-bg2.png';
import workerRiskImage from '../assets/risk-detail.png';

const DETAIL_TEMPLATES = {
  '안전난간 미설치': {
    jobName: 'A구역 작업발판 점검 작업',
    accidentType: '추락',
    improvement: '작업발판 구간의 안전난간 일부가 미설치되어 작업자 추락 위험이 존재함.',
    safetyMeasure: '글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기글자수세기',
    legalBasis: '산업안전보건기준에 관한 규칙 제43조(개구부 등의 방호조치)',
    warning: '작업발판 구간의 안전난간 일부가 미설치되어 추락 위험이 높습니다.',
    imageUrl: factoryRiskImage,
    imageWidth: 1639,
    imageHeight: 960,
    bbox: { x: 605, y: 290, width: 690, height: 590, unit: 'pixel' },
  },
  '전선 피복 손상': {
    jobName: '배전반 주변 배선 정리 작업',
    accidentType: '감전',
    improvement: '전선 피복이 손상되어 내부 도체가 노출된 상태로 감전 및 화재 위험이 존재함.',
    safetyMeasure: '손상된 전선을 즉시 교체하고 배선 보호 커버를 설치한 뒤 누전 차단 장치의 정상 작동 여부를 확인하도록 권고함.',
    legalBasis: '산업안전보건기준에 관한 규칙 제302조(전기기계·기구의 위험 방지)',
    warning: '손상된 전선의 도체가 노출되어 감전 및 화재 위험이 높습니다.',
    imageUrl: workerRiskImage,
    imageWidth: 134,
    imageHeight: 114,
    bbox: { x: 72, y: 37, width: 45, height: 44, unit: 'pixel' },
  },
  '작업자 출입통제 미준수': {
    jobName: '중량물 인양 및 이동 작업',
    accidentType: '부딪힘',
    improvement: '중량물 이동 구간에 작업자가 진입하여 설비 및 운반물과 충돌할 위험이 존재함.',
    safetyMeasure: '위험 반경에 출입통제선을 설치하고 신호수를 배치하여 작업자의 무단 접근을 제한하도록 권고함.',
    legalBasis: '산업안전보건기준에 관한 규칙 제20조(출입의 금지 등)',
    warning: '통제되지 않은 작업자가 중량물 이동 구간에 진입해 충돌 위험이 높습니다.',
    imageUrl: factoryRiskImage,
    imageWidth: 1639,
    imageHeight: 960,
    bbox: { x: 1040, y: 360, width: 330, height: 360, unit: 'pixel' },
  },
};

const FALLBACK_TEMPLATE = {
  jobName: '현장 안전점검 작업',
  accidentType: '기타',
  improvement: '현장 점검 과정에서 작업자의 안전을 저해할 수 있는 위험요인이 확인됨.',
  safetyMeasure: '위험 구간을 통제하고 원인을 제거한 후 작업 재개 전 안전관리자의 확인을 받도록 권고함.',
  legalBasis: '산업안전보건기준에 관한 규칙(해당 위험요인 관련 조항)',
  warning: '현장 위험요인이 확인되어 즉각적인 통제와 개선 조치가 필요합니다.',
  imageUrl: factoryRiskImage,
  imageWidth: 1639,
  imageHeight: 960,
  bbox: { x: 650, y: 310, width: 620, height: 520, unit: 'pixel' },
};

function dateOnly(value) {
  return value?.split(' ')[0]?.replaceAll('-', '.') ?? '-';
}

/**
 * Temporary adapter for the individual-risk report API response.
 * `imageUrl` may be a bundled asset or a signed URL. Pixel bboxes require
 * imageWidth/imageHeight; normalized bboxes may use `unit: 'ratio'`.
 */
export function buildIndividualRiskPdfData(risk) {
  const template = DETAIL_TEMPLATES[risk.riskContent] ?? FALLBACK_TEMPLATE;
  const detectedAt = dateOnly(risk.detectedAt ?? risk.createdAt);

  return {
    ...template,
    id: risk.id,
    title: risk.riskContent,
    severity: risk.riskLevel,
    processingStatus: risk.processingStatus ?? '미처리',
    location: risk.location,
    improvementRequestDate: dateOnly(risk.improvementRequestDate ?? risk.createdAt),
    reportCreatedAt: risk.createdAt,
    firstDetectedAt: detectedAt,
    imageUrl: risk.imageUrl ?? template.imageUrl,
    imageWidth: risk.imageWidth ?? template.imageWidth,
    imageHeight: risk.imageHeight ?? template.imageHeight,
    bbox: risk.bbox ?? template.bbox,
    jobName: risk.jobName ?? template.jobName,
    accidentType: risk.accidentType ?? template.accidentType,
    improvement: risk.improvement ?? template.improvement,
    safetyMeasure: risk.safetyMeasure ?? template.safetyMeasure,
    legalBasis: risk.legalBasis ?? template.legalBasis,
    warning: risk.warning ?? template.warning,
  };
}

export function individualRiskPdfFileName(risk) {
  const safeTitle = `${risk.id} ${risk.riskContent} 개별 위험성평가 보고서`.replace(/[\\/:*?"<>|]/g, '_');
  return `${safeTitle}.pdf`;
}
