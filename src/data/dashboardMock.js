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
  riskList: [
    { id: 'RISK-20261017-001', type: 'No PPE (Hard Hat)', location: 'Platform 03 · Assembly Area', severity: 'High', detectedAt: 'Oct 17, 2026 10:24', status: '미조치' },
    { id: 'RISK-20261017-002', type: 'Spill Detection', location: 'Storage Area · Chemical Store', severity: 'High', detectedAt: 'Oct 17, 2026 07:12', status: '미조치' },
    { id: 'RISK-20261016-008', type: 'Restricted Area Entry', location: 'Zone B · Loading Bay', severity: 'Medium', detectedAt: 'Oct 16, 2026 18:42', status: '확인 중' },
  ],
};
