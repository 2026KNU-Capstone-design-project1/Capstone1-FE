import { lazy, Suspense, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MetricCard from './components/dashboard/MetricCard';
import UnresolvedRiskList from './components/dashboard/RecentAlerts';
import RiskDetailCard from './components/dashboard/RiskDetailCard';
import { dashboardMock } from './data/dashboardMock';

const Factory3DView = lazy(() => import('./components/dashboard/Factory3DView'));
const FACTORY_MODEL_URL = `${import.meta.env.BASE_URL}models/factory_large.glb`;

function MapLoadingFallback() {
  return (
    <div className="grid min-h-[470px] flex-1 place-items-center bg-app-active-subtle" role="status">
      <p className="text-xs font-medium text-app-muted">3D 뷰어 준비 중...</p>
    </div>
  );
}

export default function DashboardPage() {
  const dashboard = dashboardMock;
  const navigate = useNavigate();
  const { theme } = useOutletContext();
  const [selectedRisk, setSelectedRisk] = useState(
    () => dashboard.unresolvedRisks.find(risk => risk.status === 'OPEN') ?? dashboard.featuredRisk,
  );

  return (
    <div className="dashboard-content flex flex-col gap-3">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="위험 현황 요약">
        {dashboard.metrics.map(metric => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-app-border bg-app-panel" aria-label="3D Map">
          <div className="flex h-[50px] shrink-0 items-stretch gap-3 border-b border-app-border-soft px-5">
            <div className="relative flex min-w-[88px] items-center justify-center px-3 text-[13px] font-bold text-app-text after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-app-accent">
              3D Map
            </div>
          </div>
          <Suspense fallback={<MapLoadingFallback />}>
            <Factory3DView
              modelUrl={FACTORY_MODEL_URL}
              riskZones={dashboard.riskZones}
              theme={theme}
              onRiskOpen={risk => navigate(`/risks?riskId=${risk.id}`)}
            />
          </Suspense>
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          <RiskDetailCard risk={selectedRisk} />
          <UnresolvedRiskList
            risks={dashboard.unresolvedRisks}
            selectedRiskId={selectedRisk.id}
            onSelect={setSelectedRisk}
          />
        </aside>
      </div>
    </div>
  );
}
