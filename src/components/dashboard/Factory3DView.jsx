import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, Edges, OrbitControls, useBounds, useCursor, useGLTF, useProgress } from '@react-three/drei';
import { Box3, DoubleSide, Vector3 } from 'three';
import AppIcon from '../AppIcon';

const SEVERITY_META = {
  HIGH: {
    label: 'HIGH',
    color: '#ff5f55',
    badge: 'border-[#ff6b61]/35 bg-[#ff5146]/15 text-[#ff746b]',
  },
  MEDIUM: {
    label: 'MEDIUM',
    color: '#ff8a1f',
    badge: 'border-[#ff9b3d]/35 bg-[#ff8118]/15 text-[#ff9b3d]',
  },
  LOW: {
    label: 'LOW',
    color: '#f1c84b',
    badge: 'border-[#f1c84b]/35 bg-[#f1c84b]/15 text-[#f1c84b]',
  },
};

// Custom Properties가 빠진 GLB도 현재 공장 배치에서 동작하도록 하는 폴백이다.
// extras가 포함된 GLB에서는 object.userData.zone_id/risk_target이 우선된다.
const FALLBACK_ZONE_FACILITIES = {
  A: ['BUILDING_01', 'BUILDING_02', 'BUILDING_03', 'BUILDING_04'],
  B: ['WAREHOUSE_03'],
  C: ['BUILDING_05', 'BUILDING_06'],
  D: ['WAREHOUSE_01', 'WAREHOUSE_02'],
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

function getFallbackZone(objectName) {
  return Object.entries(FALLBACK_ZONE_FACILITIES)
    .find(([, facilityNames]) => facilityNames.includes(objectName))?.[0];
}

function getFacilityId(object) {
  return object.userData.facility_id ?? object.userData.name ?? object.name;
}

function isRiskTarget(object, facilityId) {
  if (object.userData.risk_target !== undefined) return object.userData.risk_target === true;
  if (['building', 'warehouse'].includes(object.userData.category)) return true;
  return Boolean(getFallbackZone(facilityId));
}

function assignRisksToFacilities(scene, risks) {
  scene.updateMatrixWorld(true);
  const candidatesByZone = new Map();

  scene.traverse(object => {
    const facilityId = getFacilityId(object);
    if (!isRiskTarget(object, facilityId)) return;
    const zoneId = object.userData.zone_id ?? getFallbackZone(facilityId);
    if (!zoneId) return;
    const meshes = [];
    object.traverse(child => {
      if (child.isMesh) meshes.push(child);
    });
    if (meshes.length === 0) return;
    const candidates = candidatesByZone.get(zoneId) ?? [];
    candidates.push({ facility: object, facilityId, meshes });
    candidatesByZone.set(zoneId, candidates);
  });

  candidatesByZone.forEach(candidates => {
    candidates.sort((a, b) => a.facilityId.localeCompare(b.facilityId));
  });

  const usedCountByZone = new Map();

  return risks.flatMap(risk => {
    const zoneId = String(risk.zoneId ?? risk.zone_id ?? '').toUpperCase();
    const candidates = candidatesByZone.get(zoneId) ?? [];
    if (candidates.length === 0) return [];

    const usedCount = usedCountByZone.get(zoneId) ?? 0;
    const numericId = Number(risk.id);
    const stableOffset = Number.isFinite(numericId) ? Math.abs(numericId) : 0;
    const target = candidates[(stableOffset + usedCount) % candidates.length];
    usedCountByZone.set(zoneId, usedCount + 1);

    const bounds = new Box3().setFromObject(target.facility);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const markerLift = Math.max(2.2, size.y * 0.1);

    return [{
      facilityId: target.facilityId,
      meshes: target.meshes.map(mesh => ({
        geometry: mesh.geometry,
        matrix: mesh.matrixWorld.clone(),
        uuid: mesh.uuid,
      })),
      markerPosition: [center.x, bounds.max.y + markerLift, center.z],
      risk: { ...risk, zoneId },
    }];
  });
}

function RiskHighlight({ assignment, hovered, selected, onHover, onSelect }) {
  const { meshes, risk } = assignment;
  const severity = SEVERITY_META[risk.severity] ?? SEVERITY_META.MEDIUM;

  useCursor(hovered, 'pointer');

  function selectRisk(event) {
    event.stopPropagation();
    onSelect?.(risk);
  }

  return (
    meshes.map(mesh => (
      <mesh
        key={mesh.uuid}
        geometry={mesh.geometry}
        matrix={mesh.matrix}
        matrixAutoUpdate={false}
        onClick={selectRisk}
        onPointerOver={event => {
          event.stopPropagation();
          onHover?.(risk.id);
        }}
        onPointerOut={() => onHover?.(null)}
      >
        <meshBasicMaterial
          color={severity.color}
          depthWrite={false}
          opacity={hovered ? 0.46 : selected ? 0.36 : 0.24}
          polygonOffset
          polygonOffsetFactor={-2}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
        <Edges color={severity.color} lineWidth={hovered ? 3 : 2} threshold={18} />
      </mesh>
    ))
  );
}

function RiskProjection({ assignments, itemRefs, selectedRiskId }) {
  const projected = useMemo(() => new Vector3(), []);
  const invalidate = useThree(state => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [assignments, invalidate, selectedRiskId]);

  useFrame(({ camera, size }) => {
    assignments.forEach(assignment => {
      const element = itemRefs.current.get(assignment.risk.id);
      if (!element) return;

      projected.set(...assignment.markerPosition).project(camera);
      const visible = projected.z >= -1 && projected.z <= 1;
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      const selected = selectedRiskId === assignment.risk.id;

      element.style.display = visible ? 'block' : 'none';
      element.style.opacity = visible ? '1' : '0';
      element.style.zIndex = selected ? '10' : '20';
      element.style.transform = selected
        ? `translate3d(${x}px, ${y}px, 0) translate(-50%, calc(-100% - 10px))`
        : `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  });

  return null;
}

function RiskOverlayDom({ risks, itemRefs, hoveredRiskId, selectedRiskId, onHover, onSelect, onOpen }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[12]">
      {risks.map(risk => {
          const selected = selectedRiskId === risk.id;
          const hovered = hoveredRiskId === risk.id;
          const severity = SEVERITY_META[risk.severity] ?? SEVERITY_META.MEDIUM;

          return (
            <div
              key={risk.id}
              ref={element => {
                if (element) itemRefs.current.set(risk.id, element);
                else itemRefs.current.delete(risk.id);
              }}
              className="pointer-events-none absolute top-0 left-0 opacity-0"
            >
              {selected ? (
                <button
                  className="pointer-events-auto group w-[238px] overflow-hidden rounded-xl border border-white/25 bg-[linear-gradient(145deg,rgba(28,57,72,.92),rgba(7,27,39,.86))] px-4 py-3.5 text-left text-app-text shadow-[0_16px_38px_rgba(0,0,0,.46),inset_0_1px_0_rgba(255,255,255,.14)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-white/40"
                  type="button"
                  aria-label={`${risk.hazard} 위험 상세 모달 열기`}
                  onPointerDown={event => event.stopPropagation()}
                  onClick={event => {
                    event.stopPropagation();
                    onOpen?.(risk);
                  }}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold tracking-[.14em] text-[#a9bbc7]">{risk.zoneId} ZONE · 위험 #{risk.id}</span>
                    <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-[.06em] ${severity.badge}`}>
                      {severity.label}
                    </span>
                  </span>
                  <span className="mt-2 block text-[14px] font-bold leading-5 text-[#f3f7fa]">{risk.hazard}</span>
                  <span className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[11px] text-[#a9bbc7]">
                    <AppIcon name="clock" className="h-3.5 w-3.5" />
                    발견 시점 {risk.detectedAt}
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    className="pointer-events-auto group relative grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-[#102a38]/90 shadow-[0_6px_20px_rgba(0,0,0,.42)] backdrop-blur-md transition-transform hover:scale-110"
                    type="button"
                    aria-label={`${risk.zoneId}구역 ${risk.hazard} 위험 정보 보기`}
                    onPointerDown={event => event.stopPropagation()}
                    onMouseEnter={() => onHover?.(risk.id)}
                    onMouseLeave={() => onHover?.(null)}
                    onClick={event => {
                      event.stopPropagation();
                      onSelect?.(risk);
                    }}
                    style={{ color: severity.color }}
                  >
                    <span className="absolute inset-0 animate-ping rounded-full border opacity-30" style={{ borderColor: severity.color }} />
                    <AppIcon name="warning" className="h-5 w-5" strokeWidth={2.1} />
                  </button>
                  {hovered && (
                    <div className="pointer-events-none absolute bottom-[calc(100%+9px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/20 bg-[#0a202d]/95 px-3 py-2 text-[12px] font-bold text-app-text shadow-xl backdrop-blur-md">
                      {risk.hazard}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
      })}
    </div>
  );
}

function FactoryModel({ modelUrl, resetKey, riskZones, hoveredRiskId, selectedRiskId, itemRefs, onRiskHover, onRiskSelect }) {
  const { scene } = useGLTF(modelUrl);
  const bounds = useBounds();
  const assignments = useMemo(
    () => assignRisksToFacilities(scene, riskZones),
    [riskZones, scene],
  );

  useEffect(() => {
    bounds.refresh().fit().clip();
  }, [bounds, resetKey, scene]);

  return (
    <group>
      <primitive object={scene} dispose={null} />
      {assignments.map(assignment => (
        <RiskHighlight
          key={assignment.risk.id}
          assignment={assignment}
          hovered={hoveredRiskId === assignment.risk.id}
          selected={selectedRiskId === assignment.risk.id}
          onHover={onRiskHover}
          onSelect={onRiskSelect}
        />
      ))}
      <RiskProjection
        assignments={assignments}
        itemRefs={itemRefs}
        selectedRiskId={selectedRiskId}
      />
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

export default function Factory3DView({ modelUrl, riskZones = [], onRiskOpen }) {
  const [resetKey, setResetKey] = useState(0);
  const [hoveredRiskId, setHoveredRiskId] = useState(null);
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const overlayItemRefs = useRef(new Map());

  return (
    <div className="relative h-full min-h-[470px] overflow-hidden bg-[#091f2c]" aria-label="공장 디지털 트윈 3D 뷰어">
      <ModelErrorBoundary fallback={<ModelErrorMessage />}>
        <Canvas
          camera={{ fov: 36, near: 0.1, far: 5000, position: [140, 110, 170] }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
          onPointerMissed={() => {
            setHoveredRiskId(null);
            setSelectedRiskId(null);
          }}
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
                hoveredRiskId={hoveredRiskId}
                selectedRiskId={selectedRiskId}
                itemRefs={overlayItemRefs}
                onRiskHover={setHoveredRiskId}
                onRiskSelect={risk => setSelectedRiskId(risk.id)}
              />
            </Suspense>
          </Bounds>
        </Canvas>
      </ModelErrorBoundary>

      <RiskOverlayDom
        risks={riskZones}
        itemRefs={overlayItemRefs}
        hoveredRiskId={hoveredRiskId}
        selectedRiskId={selectedRiskId}
        onHover={setHoveredRiskId}
        onSelect={risk => setSelectedRiskId(risk.id)}
        onOpen={onRiskOpen}
      />

      <ModelLoadProgress />

      <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#071823]/75 px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-app-text-soft backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#43d596] shadow-[0_0_8px_#43d596]" />
        FACTORY DIGITAL TWIN
      </div>
      <button
        className="absolute top-4 right-4 z-20 rounded-md border border-white/15 bg-[#071823]/75 px-3 py-1.5 text-xs font-medium text-app-text-soft backdrop-blur-sm transition-colors hover:border-app-border-hover hover:text-white"
        type="button"
        onClick={() => setResetKey(key => key + 1)}
      >
        뷰 초기화
      </button>
      <p className="pointer-events-none absolute right-4 bottom-3 left-4 text-center text-[11px] text-app-muted">
        위험 카드를 클릭하면 상세 화면으로 이동합니다 · 드래그: 회전 · 스크롤: 확대/축소
      </p>
    </div>
  );
}
