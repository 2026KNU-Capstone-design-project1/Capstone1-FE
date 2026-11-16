import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, Edges, OrbitControls, useBounds, useGLTF, useProgress } from '@react-three/drei';
import { Box3, DoubleSide, Vector3 } from 'three';

const ACTIVE_RISK_STATUSES = new Set(['OPEN', 'IN_PROGRESS']);
const SEVERITY_PRIORITY = { LOW: 1, MEDIUM: 2, HIGH: 3 };

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

function getRiskFacilityEngName(risk) {
  return risk.engName
    ?? risk.eng_name
    ?? risk.facilityEngName
    ?? risk.facility?.engName
    ?? risk.facility?.eng_name;
}

function groupActiveRisksByFacility(risks) {
  const groupsByFacility = new Map();

  risks.forEach(risk => {
    if (!ACTIVE_RISK_STATUSES.has(risk.status)) return;

    const engName = String(getRiskFacilityEngName(risk) ?? '').trim().toUpperCase();
    if (!engName) return;

    const severity = String(risk.severity ?? risk.riskLevel ?? 'MEDIUM').toUpperCase();
    const normalizedRisk = {
      ...risk,
      engName,
      hazard: risk.hazard ?? risk.content ?? '-',
      severity,
    };

    const risksInFacility = groupsByFacility.get(engName) ?? [];
    risksInFacility.push(normalizedRisk);
    groupsByFacility.set(engName, risksInFacility);
  });

  return Array.from(groupsByFacility, ([engName, risksInFacility]) => ({
    engName,
    facilityId: risksInFacility[0].facilityId ?? risksInFacility[0].facility?.id,
    facilityName: risksInFacility[0].facilityName ?? risksInFacility[0].facility?.name,
    risks: risksInFacility,
    highestSeverity: risksInFacility.reduce((highest, risk) => (
      (SEVERITY_PRIORITY[risk.severity] ?? 0) > (SEVERITY_PRIORITY[highest] ?? 0)
        ? risk.severity
        : highest
    ), 'LOW'),
  }));
}

function assignRiskGroupsToFacilities(scene, riskGroups) {
  scene.updateMatrixWorld(true);
  const requestedEngNames = new Set(riskGroups.map(group => group.engName));
  const facilitiesByEngName = new Map();

  scene.traverse(object => {
    const engName = String(object.userData.engName ?? object.userData.eng_name ?? object.name ?? '').toUpperCase();
    if (!requestedEngNames.has(engName)) return;

    const meshes = [];
    object.traverse(child => {
      if (child.isMesh) meshes.push(child);
    });
    if (meshes.length === 0) return;
    facilitiesByEngName.set(engName, { facility: object, meshes });
  });

  return riskGroups.flatMap(group => {
    const target = facilitiesByEngName.get(group.engName);
    if (!target) return [];

    const bounds = new Box3().setFromObject(target.facility);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const markerLift = Math.max(2.2, size.y * 0.1);

    return [{
      facilityId: group.facilityId,
      meshes: target.meshes.map(mesh => ({
        geometry: mesh.geometry,
        matrix: mesh.matrixWorld.clone(),
        uuid: mesh.uuid,
      })),
      markerPosition: [center.x, bounds.max.y + markerLift, center.z],
      group,
    }];
  });
}

function RiskHighlight({ assignment, hovered, onHover }) {
  const { group, meshes } = assignment;
  const severity = SEVERITY_META[group.highestSeverity] ?? SEVERITY_META.MEDIUM;

  return (
    meshes.map(mesh => (
      <mesh
        key={mesh.uuid}
        geometry={mesh.geometry}
        matrix={mesh.matrix}
        matrixAutoUpdate={false}
        onPointerOver={event => {
          event.stopPropagation();
          onHover?.(group.engName);
        }}
        onPointerOut={() => onHover?.(null)}
      >
        <meshBasicMaterial
          color={severity.color}
          depthWrite={false}
          opacity={hovered ? 0.46 : 0.24}
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

function RiskProjection({ assignments, itemRefs }) {
  const projected = useMemo(() => new Vector3(), []);
  const invalidate = useThree(state => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [assignments, invalidate]);

  useFrame(({ camera, size }) => {
    assignments.forEach(assignment => {
      const element = itemRefs.current.get(assignment.group.engName);
      if (!element) return;

      projected.set(...assignment.markerPosition).project(camera);
      const visible = projected.z >= -1 && projected.z <= 1;
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      element.style.display = visible ? 'block' : 'none';
      element.style.opacity = visible ? '1' : '0';
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  });

  return null;
}

function RiskOverlayDom({ riskGroups, itemRefs, hoveredFacilityName, onHover, onOpen }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[12]">
      {riskGroups.map(group => {
          const hovered = hoveredFacilityName === group.engName;
          const groupSeverity = SEVERITY_META[group.highestSeverity] ?? SEVERITY_META.MEDIUM;

          return (
            <div
              key={group.engName}
              ref={element => {
                if (element) itemRefs.current.set(group.engName, element);
                else itemRefs.current.delete(group.engName);
              }}
              className={`pointer-events-none absolute top-0 left-0 opacity-0 ${hovered ? 'z-30' : 'z-20'}`}
            >
              <div
                className="pointer-events-auto relative"
                onMouseEnter={() => onHover?.(group.engName)}
                onMouseLeave={() => onHover?.(null)}
              >
                <button
                  className="relative grid h-8 min-w-8 place-items-center rounded-full border border-white/80 px-2 text-[12px] font-black tabular-nums text-white transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  type="button"
                  aria-label={`${group.facilityName ?? group.engName} 미처리 위험 ${group.risks.length}건`}
                  style={{
                    backgroundColor: groupSeverity.color,
                    boxShadow: `0 5px 16px rgba(0,0,0,.42), 0 0 0 3px ${groupSeverity.color}24`,
                  }}
                  onPointerDown={event => event.stopPropagation()}
                  onFocus={() => onHover?.(group.engName)}
                  onBlur={event => {
                    if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) onHover?.(null);
                  }}
                >
                  {group.risks.length}
                </button>
                {hovered && (
                  <div className="absolute bottom-full left-1/2 w-[280px] -translate-x-1/2 pb-2">
                    <div className="max-h-[220px] overflow-y-auto rounded-xl border border-white/20 bg-[#0a202d]/96 p-1.5 shadow-[0_16px_38px_rgba(0,0,0,.46)] backdrop-blur-xl">
                      {group.risks.map(risk => {
                        const severity = SEVERITY_META[risk.severity] ?? SEVERITY_META.MEDIUM;

                        return (
                          <button
                            key={risk.id}
                            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-none"
                            type="button"
                            aria-label={`${risk.hazard}, 위험도 ${severity.label}, 상세 보기`}
                            onClick={event => {
                              event.stopPropagation();
                              onOpen?.(risk);
                            }}
                          >
                            <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-[#e7edf5]">{risk.hazard}</span>
                            <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-[.06em] ${severity.badge}`}>
                              {severity.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
      })}
    </div>
  );
}

function FactoryModel({ modelUrl, resetKey, riskGroups, hoveredFacilityName, itemRefs, onRiskHover }) {
  const { scene } = useGLTF(modelUrl);
  const bounds = useBounds();
  const assignments = useMemo(
    () => assignRiskGroupsToFacilities(scene, riskGroups),
    [riskGroups, scene],
  );

  useEffect(() => {
    bounds.refresh().fit().clip();
  }, [bounds, resetKey, scene]);

  return (
    <group>
      <primitive object={scene} dispose={null} />
      {assignments.map(assignment => (
        <RiskHighlight
          key={assignment.group.engName}
          assignment={assignment}
          hovered={hoveredFacilityName === assignment.group.engName}
          onHover={onRiskHover}
        />
      ))}
      <RiskProjection
        assignments={assignments}
        itemRefs={itemRefs}
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
    <div className="absolute inset-0 z-20 grid place-items-center bg-app-active-subtle px-6 text-center" role="alert">
      <div>
        <p className="text-sm font-bold text-app-text">3D 모델을 표시할 수 없습니다.</p>
        <p className="mt-2 text-xs text-app-muted">모델 파일을 확인한 뒤 페이지를 새로고침해 주세요.</p>
      </div>
    </div>
  );
}

export default function Factory3DView({ modelUrl, riskZones = [], theme = 'dark', onRiskOpen }) {
  const [resetKey, setResetKey] = useState(0);
  const [hoveredFacilityName, setHoveredFacilityName] = useState(null);
  const overlayItemRefs = useRef(new Map());
  const riskGroups = useMemo(() => groupActiveRisksByFacility(riskZones), [riskZones]);
  const sceneBackground = theme === 'light' ? '#eef2f7' : '#091f2c';

  return (
    <div className="relative h-full min-h-[470px] overflow-hidden bg-app-active-subtle" aria-label="공장 디지털 트윈 3D 뷰어">
      <ModelErrorBoundary fallback={<ModelErrorMessage />}>
        <Canvas
          camera={{ fov: 36, near: 0.1, far: 5000, position: [140, 110, 170] }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
          onPointerMissed={() => {
            setHoveredFacilityName(null);
          }}
        >
          <color attach="background" args={[sceneBackground]} />
          <hemisphereLight args={theme === 'light' ? ['#ffffff', '#8ca0ad', 2.8] : ['#d9ecff', '#18313d', 2.2]} />
          <directionalLight color="#ffffff" intensity={theme === 'light' ? 3.4 : 2.8} position={[90, 140, 70]} />
          <directionalLight color={theme === 'light' ? '#c9d9e5' : '#7eb6dd'} intensity={theme === 'light' ? 1.5 : 1.2} position={[-90, 70, -100]} />
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
                riskGroups={riskGroups}
                hoveredFacilityName={hoveredFacilityName}
                itemRefs={overlayItemRefs}
                onRiskHover={setHoveredFacilityName}
              />
            </Suspense>
          </Bounds>
        </Canvas>
      </ModelErrorBoundary>

      <RiskOverlayDom
        riskGroups={riskGroups}
        itemRefs={overlayItemRefs}
        hoveredFacilityName={hoveredFacilityName}
        onHover={setHoveredFacilityName}
        onOpen={onRiskOpen}
      />

      <ModelLoadProgress />

      <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#071823]/75 px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-[#c4d0d9] backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#43d596] shadow-[0_0_8px_#43d596]" />
        FACTORY DIGITAL TWIN
      </div>
      <button
        className="absolute top-4 right-4 z-20 rounded-md border border-white/15 bg-[#071823]/75 px-3 py-1.5 text-xs font-medium text-[#c4d0d9] backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white"
        type="button"
        onClick={() => setResetKey(key => key + 1)}
      >
        뷰 초기화
      </button>
      <p className="pointer-events-none absolute right-4 bottom-3 left-4 text-center text-[11px] text-app-muted">
        위험 개수에 마우스를 올리면 목록을 확인할 수 있습니다 · 드래그: 회전 · 스크롤: 확대/축소
      </p>
    </div>
  );
}
