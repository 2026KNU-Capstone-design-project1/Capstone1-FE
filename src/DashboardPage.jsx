import { useState } from 'react';
import MetricCard from './components/dashboard/MetricCard';
import RecentAlerts from './components/dashboard/RecentAlerts';
import RiskDetailCard from './components/dashboard/RiskDetailCard';
import { dashboardMock } from './data/dashboardMock';

export default function DashboardPage() {
  const dashboard = dashboardMock;
  const [view, setView] = useState('map');

  return (
    <div className="dashboard-content flex flex-col gap-3">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="위험 현황 요약">
        {dashboard.metrics.map(metric => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="relative min-h-[520px] overflow-hidden rounded-xl border border-app-border bg-app-panel" aria-label={view === 'map' ? '3D Map' : '위험 목록'}>
          <div className="absolute top-3 left-4 z-10 flex gap-4">
            <button
              className={`h-8 min-w-[98px] cursor-pointer rounded-lg border px-4 text-[12px] font-bold transition-colors ${view === 'map' ? 'border-[#df760f] bg-[#17262f] text-white' : 'border-[#314b5b] bg-[#0d202b] text-[#a7b6c1] hover:bg-[#17303d] hover:text-white'}`}
              type="button"
              onClick={() => setView('map')}
              aria-pressed={view === 'map'}
            >3D Map</button>
            <button
              className={`h-8 min-w-[98px] cursor-pointer rounded-lg border px-4 text-[12px] font-bold transition-colors ${view === 'list' ? 'border-[#df760f] bg-[#17262f] text-white' : 'border-[#314b5b] bg-[#0d202b] text-[#a7b6c1] hover:bg-[#17303d] hover:text-white'}`}
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
            >List View</button>
          </div>
          {view === 'map' ? (
            <div className="h-full min-h-[520px]" aria-label="3D Map 영역 - 추후 구현" />
          ) : (
            <div className="overflow-x-auto px-4 pt-16 pb-5">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead className="text-app-muted">
                  <tr className="border-b border-app-border">
                    <th className="px-4 py-3 font-medium">위험 ID</th>
                    <th className="px-4 py-3 font-medium">위험 유형</th>
                    <th className="px-4 py-3 font-medium">위치</th>
                    <th className="px-4 py-3 font-medium">위험도</th>
                    <th className="px-4 py-3 font-medium">감지 시점</th>
                    <th className="px-4 py-3 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.riskList.map(risk => (
                    <tr key={risk.id} className="cursor-pointer border-b border-app-border-soft text-app-text transition-colors last:border-0 hover:bg-app-hover">
                      <td className="px-4 py-4 text-app-muted">#{risk.id}</td>
                      <td className="px-4 py-4 font-medium">{risk.type}</td>
                      <td className="px-4 py-4 text-app-muted">{risk.location}</td>
                      <td className="px-4 py-4"><span className={`rounded-md px-2.5 py-1 text-xs ${risk.severity === 'High' ? 'bg-[#5a2025] text-[#ff6a62]' : 'bg-[#51421e] text-[#ffc458]'}`}>{risk.severity}</span></td>
                      <td className="px-4 py-4 text-app-muted">{risk.detectedAt}</td>
                      <td className="px-4 py-4"><span className="rounded-md border border-[#355061] px-2.5 py-1 text-xs">{risk.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          <RiskDetailCard risk={dashboard.featuredRisk} />
          <RecentAlerts alerts={dashboard.recentAlerts} />
        </aside>
      </div>
    </div>
  );
}
