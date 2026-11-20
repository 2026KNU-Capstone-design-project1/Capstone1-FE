const ACTIVE_RISK_STATUSES = new Set(['OPEN', 'IN_PROGRESS']);
const SEVERITY_PRIORITY = { LOW: 1, MEDIUM: 2, HIGH: 3 };

function getFacilityEngName(risk) {
  return risk.engName
    ?? risk.eng_name
    ?? risk.facilityEngName
    ?? risk.facility?.engName
    ?? risk.facility?.eng_name;
}

function getSeverity(risk) {
  return String(risk.severity ?? risk.riskLevel ?? risk.level ?? 'LOW').toUpperCase();
}

export function buildFacilityRiskMarkerData(risks = [], facilityPositions = []) {
  const positionsByEngName = new Map(
    facilityPositions.map(position => [String(position.engName).trim().toUpperCase(), position]),
  );
  const groupsByEngName = new Map();

  risks.forEach(risk => {
    if (!ACTIVE_RISK_STATUSES.has(String(risk.rawStatus ?? risk.status).toUpperCase())) return;

    const engName = String(getFacilityEngName(risk) ?? '').trim().toUpperCase();
    if (!engName) return;

    const group = groupsByEngName.get(engName) ?? {
      engName,
      facilityName: risk.facilityName ?? risk.facility?.name ?? engName,
      count: 0,
      highestSeverity: 'LOW',
      riskIds: [],
    };
    const severity = getSeverity(risk);

    group.count += 1;
    group.riskIds.push(String(risk.id));
    if ((SEVERITY_PRIORITY[severity] ?? 0) > (SEVERITY_PRIORITY[group.highestSeverity] ?? 0)) {
      group.highestSeverity = severity;
    }
    groupsByEngName.set(engName, group);
  });

  const markers = [];
  const unmappedFacilityNames = [];

  groupsByEngName.forEach((group, engName) => {
    const position = positionsByEngName.get(engName);
    const hasValidPosition = position
      && Number.isFinite(position.x)
      && Number.isFinite(position.y)
      && position.x >= 0
      && position.x <= 100
      && position.y >= 0
      && position.y <= 100;

    if (!hasValidPosition) {
      unmappedFacilityNames.push(engName);
      return;
    }

    markers.push({
      id: `facility-risk-${engName}`,
      ...group,
      x: position.x,
      y: position.y,
      label: `${group.facilityName} 미해결 위험 ${group.count}건`,
    });
  });

  return { markers, unmappedFacilityNames };
}
