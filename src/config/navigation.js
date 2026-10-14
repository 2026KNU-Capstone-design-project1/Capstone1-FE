export const appNavigation = [
  { to: '/dashboard', label: '대시보드', title: 'Safety Dashboard', icon: 'dashboard' },
  { to: '/risks', label: '위험 관리', title: '위험 관리', icon: 'risk' },
  { to: '/videos', label: '영상 관리', title: '영상 관리', icon: 'video' },
  { to: '/history', label: '위험 이력', title: '위험 이력', icon: 'history' },
  { to: '/reports', label: 'AI 보고서', title: 'AI 보고서', icon: 'report' },
  { to: '/settings', label: '환경설정', title: '환경설정', icon: 'settings' },
];

export function getPageTitle(pathname) {
  return appNavigation.find(item => item.to === pathname)?.title || 'VIRNECT Safety';
}
