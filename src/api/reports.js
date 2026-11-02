import { authorizedRequest } from './auth';

function toIndividualReport(report) {
  return {
    reportId: report.reportId,
    riskId: report.riskId,
    id: `RISK-${String(report.riskId).padStart(3, '0')}`,
    reportType: 'individual',
    taskName: report.taskName,
    riskContent: report.taskName ?? '-',
    location: report.location ?? '-',
    riskType: report.riskType ?? '-',
    riskLevel: report.riskLevel ?? '-',
    createdAt: report.createdAt,
    status: '생성 완료',
    improvement: report.riskContent ?? '-',
    safetyMeasure: report.safetyStep ?? '-',
    legalBasis: report.legalBasis ?? '-',
    jobName: report.taskName ?? '-',
    accidentType: report.riskType ?? '-',
  };
}

export async function getReports(options = {}) {
  const response = await authorizedRequest('/api/reports/individual', options);

  if (!Array.isArray(response)) {
    throw new Error('보고서 목록 응답 형식이 올바르지 않습니다.');
  }

  return response.map(toIndividualReport);
}
