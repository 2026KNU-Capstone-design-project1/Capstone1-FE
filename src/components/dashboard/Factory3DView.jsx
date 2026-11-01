import { Component, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Edges, Html, Line, OrbitControls, useBounds, useCursor, useGLTF, useProgress } from '@react-three/drei';
import AppIcon from '../AppIcon';

const SEVERITY_META = {
  High: {
    label: 'HIGH',
    color: '#ff5f55',
    badge: 'border-[#ff6b61]/35 bg-[#ff5146]/15 text-[#ff746b]',
  },
  Medium: {
    label: 'MEDIUM',
    color: '#ff8a1f',
    badge: 'border-[#ff9b3d]/35 bg-[#ff8118]/15 text-[#ff9b3d]',
  },
  Low: {
    label: 'LOW',
    color: '#f1c84b',
    badge: 'border-[#f1c84b]/35 bg-[#f1c84b]/15 text-[#f1c84b]',
  },
};

function ModelLoadProgress() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#091f2c]/90" role="status" aria-live="polite">
      <div className="w-48 text-center">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-app-accent transition-[width] duration-200" style={{ width: `${Math.round(progress)}%` }} />
        </div>
        <p className="text-xs font-medium text-app-text-soft">3D 모델 불러오는 중 · {Math.round(progress)}%</p>
      </div>
    </div>
  );
}

function RiskPanel({ zone, onClose }) {
  const severity = SEVERITY_META[zone.severity] ?? SEVERITY_META.Medium;
  const rows = [
    { icon: 'risk', label: '위험 내용', value: zone.content },
    { icon: 'warning', label: '위험 등급', value: severity.label, severity: true },
    { icon: 'site', label: '발생 구역', value: zone.area },
    { icon: 'clock', label: '최근 발견', value: zone.detectedAt },
  ];

  return (
    <div
      className="w-[310px] max-w-[calc(100vw-72px)] overflow-hidden rounded-2xl border border-white/25 bg-[linear-gradient(145deg,rgba(25,53,68,.88),rgba(8,28,40,.76))] text-app-text shadow-[0_18px_50px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl"
      onPointerDown={event => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: severity.color }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: severity.color }} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[.16em] text-app-muted">RISK DETECTED</p>
            <p className="truncate text-xs font-semibold text-app-text-soft">{zone.id}</p>
          </div>
        </div>
        <button
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-app-muted transition-colors hover:bg-white/10 hover:text-white"
          type="button"
          aria-label="위험 정보 닫기"
          onClick={onClose}
        >
          <AppIcon name="close" className="h-4 w-4" />
        </button>
      </div>

      <dl className="px-4 py-2.5">
        {rows.map(row => (
          <div key={row.label} className="grid grid-cols-[20px_72px_minmax(0,1fr)] items-center gap-2 border-b border-white/10 py-2.5 last:border-0">
            <AppIcon name={row.icon} className={`h-[18px] w-[18px] ${row.severity ? 'text-app-accent' : 'text-[#d8e4ec]'}`} />
            <dt className="text-xs text-[#a9bbc7]">{row.label}</dt>
            <dd className="min-w-0 text-[13px] font-semibold text-[#f3f7fa]">
              {row.severity ? (
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-extrabold tracking-[.08em] ${severity.badge}`}>{row.value}</span>
              ) : row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RiskZone({ zone, selected, onSelect, onDeselect }) {
  const [hovered, setHovered] = useState(false);
  const severity = SEVERITY_META[zone.severity] ?? SEVERITY_META.Medium;
  const color = zone.color ?? severity.color;
  const highlighted = hovered || selected;
  const markerPosition = [0, zone.size[1] / 2 + 2.4, 0];
  const panelPosition = zone.panelOffset ?? [zone.size[0] + 12, zone.size[1] + 10, 0];

  useCursor(hovered, 'pointer');

  return (
    <group position={zone.position} rotation={zone.rotation ?? [0, 0, 0]}>
      <mesh
        onClick={event => {
          event.stopPropagation();
          onSelect(zone);
        }}
        onPointerOver={event => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={zone.size} />
        <meshBasicMaterial color={color} depthWrite={false} opacity={highlighted ? 0.24 : 0.1} transparent />
        <Edges color={color} lineWidth={highlighted ? 2.5 : 1.5} threshold={15} />
      </mesh>

      <Html center position={markerPosition} zIndexRange={[80, 0]}>
        <button
          className="group relative grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-[#102a38]/90 shadow-[0_5px_18px_rgba(0,0,0,.38)] backdrop-blur-md transition-transform hover:scale-110"
          type="button"
          aria-label={`${zone.content} 위험 정보 보기`}
          onClick={event => {
            event.stopPropagation();
            onSelect(zone);
          }}
          style={{ color }}
        >
          <span className={`absolute inset-0 rounded-full ${selected ? 'animate-ping' : ''}`} style={{ border: `1px solid ${color}`, opacity: 0.38 }} />
          <AppIcon name="warning" className="h-5 w-5" strokeWidth={2.1} />
        </button>
      </Html>

      {selected && (
        <>
          <Line
            color={color}
            depthTest={false}
            lineWidth={1.7}
            opacity={0.9}
            points={[markerPosition, panelPosition]}
            transparent
          />
          <mesh position={markerPosition}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial color={color} depthTest={false} />
          </mesh>
          <Html center position={panelPosition} zIndexRange={[100, 0]}>
            <RiskPanel zone={zone} onClose={event => {
              event.stopPropagation();
              onDeselect();
            }} />
          </Html>
        </>
      )}
      {!selected && hovered && (
        <Html center position={[0, markerPosition[1] + 4.2, 0]} pointerEvents="none" zIndexRange={[60, 0]}>
          <div className="whitespace-nowrap rounded-md border border-white/15 bg-[#0a202d]/90 px-2.5 py-1.5 text-[11px] font-bold text-app-text shadow-lg backdrop-blur-md">
            {zone.content}
          </div>
        </Html>
      )}
    </group>
  );
}

function FactoryModel({ modelUrl, resetKey, riskZones, selectedRiskId, onRiskZoneSelect }) {
  const { scene } = useGLTF(modelUrl);
  const bounds = useBounds();

  useEffect(() => {
    bounds.refresh().fit().clip();
  }, [bounds, resetKey, scene]);

  return (
    <group>
      <primitive object={scene} dispose={null} />
      {riskZones.map(zone => (
        <RiskZone
          key={zone.id}
          zone={zone}
          selected={selectedRiskId === zone.id}
          onSelect={onRiskZoneSelect}
          onDeselect={() => onRiskZoneSelect(null)}
        />
      ))}
    </group>
  );
}

class ModelErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function ModelErrorMessage() {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[#091f2c] px-6 text-center" role="alert">
      <div>
        <p className="text-sm font-bold text-app-text">3D 모델을 표시할 수 없습니다.</p>
        <p className="mt-2 text-xs text-app-muted">모델 파일을 확인한 뒤 페이지를 새로고침해 주세요.</p>
      </div>
    </div>
  );
}

export default function Factory3DView({ modelUrl, riskZones = [], onRiskZoneSelect }) {
  const [resetKey, setResetKey] = useState(0);
  const [selectedRiskId, setSelectedRiskId] = useState(null);

  const selectRiskZone = zone => {
    setSelectedRiskId(zone?.id ?? null);
    onRiskZoneSelect?.(zone ?? null);
  };

  return (
    <div className="relative h-full min-h-[470px] overflow-hidden bg-[#091f2c]" aria-label="공장 디지털 트윈 3D 뷰어">
      <ModelErrorBoundary fallback={<ModelErrorMessage />}>
        <Canvas
          camera={{ fov: 36, near: 0.1, far: 5000, position: [140, 110, 170] }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#091f2c']} />
          <hemisphereLight args={['#d9ecff', '#18313d', 2.2]} />
          <directionalLight color="#ffffff" intensity={2.8} position={[90, 140, 70]} />
          <directionalLight color="#7eb6dd" intensity={1.2} position={[-90, 70, -100]} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2.02}
            minPolarAngle={0.12}
            regress
            screenSpacePanning
          />
          <Bounds margin={1.16} observe>
            <Suspense fallback={null}>
              <FactoryModel
                modelUrl={modelUrl}
                resetKey={resetKey}
                riskZones={riskZones}
                selectedRiskId={selectedRiskId}
                onRiskZoneSelect={selectRiskZone}
              />
            </Suspense>
          </Bounds>
        </Canvas>
      </ModelErrorBoundary>

      <ModelLoadProgress />

      <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#071823]/75 px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-app-text-soft backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#43d596] shadow-[0_0_8px_#43d596]" />
        FACTORY DIGITAL TWIN
      </div>
      <button
        className="absolute top-4 right-4 rounded-md border border-white/15 bg-[#071823]/75 px-3 py-1.5 text-xs font-medium text-app-text-soft backdrop-blur-sm transition-colors hover:border-app-border-hover hover:text-white"
        type="button"
        onClick={() => setResetKey(key => key + 1)}
      >
        뷰 초기화
      </button>
      <p className="pointer-events-none absolute right-4 bottom-3 left-4 text-center text-[11px] text-app-muted">
        드래그: 회전 · 우클릭 드래그: 이동 · 스크롤: 확대/축소
      </p>
    </div>
  );
}
