import { useEffect, useMemo, useState } from 'react';
import factoryMapImage from '../../assets/factory_map_topdown.png';
import {
  FACTORY_MAP_BOUNDS,
  FACTORY_MAP_GEOLOCATION_OPTIONS,
  FACTORY_MAP_LOW_ACCURACY_THRESHOLD_METERS,
} from '../../config/factoryMapConfig';
import useDeviceHeading from '../../hooks/useDeviceHeading';
import { gpsToMapPosition } from '../../utils/geoCoordinates';

const INITIAL_LOCATION_STATE = {
  status: 'waiting',
  coordinates: null,
  message: 'GPS 위치를 확인하고 있습니다.',
};
const UNSUPPORTED_LOCATION_STATE = {
  status: 'unsupported',
  coordinates: null,
  message: '이 브라우저에서는 위치 기능을 지원하지 않습니다.',
};
const EMPTY_MARKERS = [];

function getInitialLocationState() {
  return typeof navigator === 'undefined' || !navigator.geolocation
    ? UNSUPPORTED_LOCATION_STATE
    : INITIAL_LOCATION_STATE;
}

function getPositionErrorState(error) {
  if (error.code === 1) {
    return {
      status: 'denied',
      coordinates: null,
      message: '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.',
    };
  }

  if (error.code === 2) {
    return {
      status: 'error',
      coordinates: null,
      message: '현재 위치를 확인할 수 없습니다. GPS 또는 네트워크 연결을 확인해 주세요.',
    };
  }

  if (error.code === 3) {
    return {
      status: 'error',
      coordinates: null,
      message: '위치 확인 시간이 초과되었습니다. GPS 위치를 계속 기다리고 있습니다.',
    };
  }

  return {
    status: 'error',
    coordinates: null,
    message: '위치를 수신하는 중 오류가 발생했습니다.',
  };
}

const FACILITY_MARKER_STYLES = {
  HIGH: 'bg-[#e54843] shadow-[0_0_0_4px_rgba(229,72,67,.2),0_3px_8px_rgba(18,30,38,.45)]',
  MEDIUM: 'bg-[#ef8125] shadow-[0_0_0_4px_rgba(239,129,37,.2),0_3px_8px_rgba(18,30,38,.4)]',
  LOW: 'bg-[#d7a426] shadow-[0_0_0_4px_rgba(215,164,38,.2),0_3px_8px_rgba(18,30,38,.35)]',
};

function CurrentLocationMarker({ position, heading }) {
  const hasHeading = Number.isFinite(heading);

  return (
    <span
      className="pointer-events-none absolute z-20 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#20a66a] shadow-[0_0_0_4px_rgba(32,166,106,.24),0_2px_7px_rgba(18,30,38,.5)]"
      style={{ left: `${position.xPercent}%`, top: `${position.yPercent}%` }}
      role="img"
      aria-label={hasHeading ? `내 현재 위치, 북쪽 기준 ${Math.round(heading)}도 방향` : '내 현재 위치'}
    >
      {hasHeading && (
        <span
          className="absolute top-1/2 left-1/2 h-9 w-9 transition-transform duration-75 ease-linear"
          style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}
          aria-hidden="true"
        >
          <span className="absolute top-0 left-1/2 h-[11px] w-[10px] -translate-x-1/2 bg-[#20a66a] drop-shadow-[0_1px_1px_rgba(255,255,255,.95)] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        </span>
      )}
    </span>
  );
}

function FacilityRiskMarker({ marker, position, onSelect }) {
  const severityStyle = FACILITY_MARKER_STYLES[marker.highestSeverity]
    ?? FACILITY_MARKER_STYLES.LOW;

  return (
    <button
      className={`pointer-events-auto absolute z-10 grid h-7 min-w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white px-1 text-[12px] leading-none font-black tabular-nums text-white transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${severityStyle}`}
      style={{ left: `${position.xPercent}%`, top: `${position.yPercent}%` }}
      type="button"
      aria-label={marker.label}
      title={marker.label}
      onClick={event => {
        event.stopPropagation();
        onSelect?.(marker);
      }}
    >
      {marker.count > 99 ? '99+' : marker.count}
    </button>
  );
}

function resolveMarkerPosition(marker, bounds) {
  if (Number.isFinite(marker.x) && Number.isFinite(marker.y)) {
    return {
      xPercent: marker.x,
      yPercent: marker.y,
      isWithinBounds: marker.x >= 0 && marker.x <= 100 && marker.y >= 0 && marker.y <= 100,
    };
  }

  if (Number.isFinite(marker.latitude) && Number.isFinite(marker.longitude)) {
    return gpsToMapPosition(marker, bounds);
  }

  return null;
}

export default function FactoryMap({
  bounds = FACTORY_MAP_BOUNDS,
  markers = EMPTY_MARKERS,
  lowAccuracyThreshold = FACTORY_MAP_LOW_ACCURACY_THRESHOLD_METERS,
  geolocationOptions = FACTORY_MAP_GEOLOCATION_OPTIONS,
  onMarkerSelect,
}) {
  const [locationState, setLocationState] = useState(getInitialLocationState);
  const {
    heading,
    requestPermission: requestHeadingPermission,
    needsPermission: needsHeadingPermission,
  } = useDeviceHeading();

  useEffect(() => {
    if (!navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      position => {
        setLocationState({
          status: 'ready',
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          message: '',
        });
      },
      error => setLocationState(getPositionErrorState(error)),
      geolocationOptions,
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [geolocationOptions]);

  const currentMapPosition = useMemo(() => {
    if (!locationState.coordinates) return null;
    return gpsToMapPosition(locationState.coordinates, bounds);
  }, [bounds, locationState.coordinates]);

  const visibleFacilityMarkers = useMemo(
    () => markers.map(marker => ({
      ...marker,
      mapPosition: resolveMarkerPosition(marker, bounds),
    })).filter(marker => marker.mapPosition?.isWithinBounds),
    [bounds, markers],
  );

  const isOutsideMap = currentMapPosition && !currentMapPosition.isWithinBounds;
  const hasLowAccuracy = locationState.coordinates
    && locationState.coordinates.accuracy > lowAccuracyThreshold;

  const messageTone = locationState.status === 'denied' || locationState.status === 'error'
    || locationState.status === 'unsupported' || isOutsideMap
    ? 'bg-[#fff2ed] text-[#b64d21]'
    : 'bg-[#eef4f6] text-[#596872]';

  return (
    <section className="mt-[15px] shrink-0 overflow-hidden rounded-[22px] border border-[#e1e6e9] bg-white shadow-[0_5px_16px_rgba(35,54,68,0.035)]" aria-labelledby="factory-map-title">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 id="factory-map-title" className="text-[15px] font-extrabold text-[#24343f]">공장 위치 지도</h2>
        <span className="rounded-full bg-[#edf2f4] px-2.5 py-1 text-[10px] font-extrabold tracking-[.08em] text-[#697780]">LIVE GPS</span>
      </div>

      <div
        className={`relative isolate w-full overflow-hidden bg-[#dfe5e8] ${needsHeadingPermission ? 'cursor-pointer' : ''}`}
        role={needsHeadingPermission ? 'button' : undefined}
        tabIndex={needsHeadingPermission ? 0 : undefined}
        aria-label={needsHeadingPermission ? '공장 지도, 선택하면 방향 센서 권한을 요청합니다.' : undefined}
        onClick={needsHeadingPermission ? requestHeadingPermission : undefined}
        onKeyDown={needsHeadingPermission ? event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            requestHeadingPermission();
          }
        } : undefined}
      >
        <img
          className="block h-auto w-full select-none"
          src={factoryMapImage}
          alt="공장 배치도"
          draggable="false"
        />

        <div className="absolute inset-0">
          {visibleFacilityMarkers.map(marker => (
            <FacilityRiskMarker
              key={marker.id}
              marker={marker}
              position={marker.mapPosition}
              onSelect={onMarkerSelect}
            />
          ))}
          {currentMapPosition?.isWithinBounds && (
            <CurrentLocationMarker
              position={currentMapPosition}
              heading={heading}
            />
          )}
        </div>
      </div>

      {(isOutsideMap || hasLowAccuracy) && (
        <div className="space-y-2 p-3" aria-live="polite">
          {isOutsideMap && (
            <p className={`rounded-xl px-3 py-2 text-[12px] leading-[18px] font-semibold ${messageTone}`} role="status">
              현재 위치가 지정된 공장 영역 밖에 있습니다.
            </p>
          )}
          {hasLowAccuracy && (
            <p className="rounded-xl bg-[#fff8e4] px-3 py-2 text-[12px] leading-[18px] font-semibold text-[#936615]">
              GPS 정확도가 낮습니다. 하늘이 잘 보이는 곳에서 잠시 기다려 주세요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
