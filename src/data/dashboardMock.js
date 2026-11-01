import alertNoPpe from '../assets/alert-no-ppe.png';
import alertSpill from '../assets/alert-spill.png';
import riskDetail from '../assets/risk-detail.png';

export const dashboardMock = {
  site: {
    id: 'riverside-manufacturing',
    name: 'Riverside Manufacturing Site',
  },
  sites: [
    { id: 'riverside-manufacturing', name: 'Riverside Manufacturing Site' },
    { id: 'seoul-assembly', name: 'Seoul Assembly Plant' },
    { id: 'incheon-logistics', name: 'Incheon Logistics Center' },
  ],
  user: {
    name: '이다은',
    role: 'Admin',
  },
  metrics: [
    { id: 'total', label: '전체 미처리 위험', value: 24, icon: 'warning', tone: 'neutral' },
    { id: 'high', label: '고위험 미처리 건수', value: 2, icon: 'flame', tone: 'danger' },
    { id: 'longTerm', label: '장기 미처리 위험', value: 4, icon: 'document', tone: 'neutral' },
    { id: 'average', label: '평균 해결 시간', value: 2.5, suffix: '일', icon: 'clock', tone: 'neutral' },
  ],
  featuredRisk: {
    id: 'RISK-20261017-001',
    image: riskDetail,
    area: 'Platform 03',
    facility: 'Assembly Area',
    type: 'No PPE (Hard Hat)',
    severity: 'High',
    detectedAt: 'Oct 17, 2026 10:24:36',
  },
  recentAlerts: [
    {
      id: 'alert-001',
      image: alertNoPpe,
      title: 'No PPE (Hard Hat)',
      location: 'Platform 03 · Assembly Area',
      time: '10:24',
      severity: 'High',
    },
    {
      id: 'alert-002',
      image: alertSpill,
      title: 'Spill Detection',
      location: 'Storage Area · Chemical Store',
      time: '07:12',
      severity: 'High',
    },
  ],
  // GLB 모델 로컬 좌표 기준. 실제 연동 시 API 응답으로 교체합니다.
  riskZones: [
    {
      id: 'RISK-20261102-001',
      content: '보호구 미착용',
      severity: 'Medium',
      area: 'A구역 · 조립라인 02',
      detectedAt: '2026.11.02 09:42',
      position: [27, 7.2, 32],
      size: [22, 17, 27],
      panelOffset: [34, 26, -2],
    },
    {
      id: 'RISK-20261102-002',
      content: '안전 통로 적재물 감지',
      severity: 'High',
      area: 'B구역 · 생산동 03',
      detectedAt: '2026.11.02 09:37',
      position: [-56, 4.65, -17],
      size: [24, 11, 20],
      panelOffset: [38, 25, -2],
    },
    {
      id: 'RISK-20261102-003',
      content: '유해물질 누출 의심',
      severity: 'High',
      area: 'C구역 · 저장탱크 04',
      detectedAt: '2026.11.02 09:31',
      position: [68, 3.1, -35],
      size: [11, 8, 12],
      panelOffset: [-34, 23, 2],
    },
  ],
  riskList: [
    { id: 'RISK-20261017-001', type: 'No PPE (Hard Hat)', location: 'Platform 03 · Assembly Area', severity: 'High', detectedAt: 'Oct 17, 2026 10:24', status: '미조치' },
    { id: 'RISK-20261017-002', type: 'Spill Detection', location: 'Storage Area · Chemical Store', severity: 'High', detectedAt: 'Oct 17, 2026 07:12', status: '미조치' },
    { id: 'RISK-20261016-008', type: 'Restricted Area Entry', location: 'Zone B · Loading Bay', severity: 'Medium', detectedAt: 'Oct 16, 2026 18:42', status: '확인 중' },
  ],
};
