import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getDashboard } from './api/dashboard';
import MetricCard from './components/dashboard/MetricCard';
import UnresolvedRiskList from './components/dashboard/RecentAlerts';
import RiskDetailCard from './components/dashboard/RiskDetailCard';

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
  const navigate = useNavigate();
  const { theme } = useOutletContext();
  const [dashboard, setDashboard] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const nextDashboard = await getDashboard({ signal: controller.signal });
        const initialRisk = nextDashboard.unresolvedRisks.find(risk => risk.status === 'OPEN') ?? null;

        setDashboard(nextDashboard);
        setSelectedRisk(initialRisk);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setDashboard(null);
          setSelectedRisk(null);
          setError(requestError.message || '대시보드를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [reloadKey]);

  if (isLoading) {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-xl border border-app-border bg-app-panel" role="status">
        <p className="text-sm font-medium text-app-muted">대시보드를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-xl border border-app-border bg-app-panel px-6 text-center" role="alert">
        <div>
          <p className="text-sm font-bold text-app-text">{error || '대시보드를 불러오지 못했습니다.'}</p>
          <button
            className="mt-4 rounded-lg bg-app-accent px-4 py-2 text-xs font-bold text-app-accent-text transition-colors hover:brightness-110"
            type="button"
            onClick={() => setReloadKey(value => value + 1)}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
            selectedRiskId={selectedRisk?.id}
            onSelect={setSelectedRisk}
          />
        </aside>
      </div>
    </div>
  );
}
