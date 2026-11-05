function dateOnly(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '-';
}

export function buildIndividualRiskPdfData(report) {
  return {
    id: report.id,
    title: report.riskContent,
    severity: report.riskLevel,
    location: report.location,
    improvementRequestDate: dateOnly(report.createdAt),
    reportCreatedAt: dateOnly(report.createdAt),
    imageUrl: report.imageUrl,
    imageWidth: report.imageWidth,
    imageHeight: report.imageHeight,
    bbox: report.bbox,
    jobName: report.jobName,
    accidentType: report.accidentType,
    improvement: report.improvement,
    safetyMeasure: report.safetyMeasure,
    legalBasis: report.legalBasis,
  };
}

export function individualRiskPdfFileName(report) {
  const safeTitle = `${report.id} ${report.riskContent} 개별 위험성평가 보고서`.replace(/[\\/:*?"<>|]/g, '_');
  return `${safeTitle}.pdf`;
}
