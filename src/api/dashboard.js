import { authorizedRequest } from './auth';

export async function getDashboard(options = {}) {
  const response = await authorizedRequest('/api/dashboard', options);
  const dashboard = response?.data ?? response;

  if (!dashboard || typeof dashboard !== 'object' || Array.isArray(dashboard)) {
    throw new Error('대시보드 응답 형식이 올바르지 않습니다.');
  }

  if (
    !Array.isArray(dashboard.metrics)
    || !Array.isArray(dashboard.unresolvedRisks)
    || !Array.isArray(dashboard.riskZones)
  ) {
    throw new Error('대시보드 응답에 필요한 목록이 없습니다.');
  }

  return dashboard;
}

export async function getFacilityRiskEvents(options = {}) {
  const dashboard = await getDashboard(options);
  return dashboard.riskZones;
}
