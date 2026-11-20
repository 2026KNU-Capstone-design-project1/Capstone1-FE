import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDeviceHeading,
  getScreenOrientationAngle,
  smoothHeading,
} from '../utils/deviceHeading';

const HEADING_SMOOTHING_FACTOR = 0.18;
const HEADING_STALE_TIMEOUT_MS = 10_000;

function getInitialPermissionState() {
  if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return 'unsupported';

  return typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ? 'required'
    : 'granted';
}

export default function useDeviceHeading() {
  const [permissionState, setPermissionState] = useState(getInitialPermissionState);
  const [heading, setHeading] = useState(null);
  const smoothedHeadingRef = useRef(null);
  const latestHeadingRef = useRef(null);
  const animationFrameRef = useRef(null);
  const staleTimeoutRef = useRef(null);

  const requestPermission = useCallback(async () => {
    const DeviceOrientation = window.DeviceOrientationEvent;
    if (!DeviceOrientation) {
      setPermissionState('unsupported');
      return false;
    }

    if (typeof DeviceOrientation.requestPermission !== 'function') {
      setPermissionState('granted');
      return true;
    }

    setPermissionState('requesting');
    try {
      const result = await DeviceOrientation.requestPermission();
      const granted = result === 'granted';
      setPermissionState(granted ? 'granted' : 'denied');
      if (!granted) setHeading(null);
      return granted;
    } catch {
      setPermissionState('denied');
      setHeading(null);
      return false;
    }
  }, []);

  useEffect(() => {
    if (permissionState !== 'granted') return undefined;

    const eventName = 'ondeviceorientationabsolute' in window
      ? 'deviceorientationabsolute'
      : 'deviceorientation';

    function updateRenderedHeading() {
      animationFrameRef.current = null;
      smoothedHeadingRef.current = smoothHeading(
        smoothedHeadingRef.current,
        latestHeadingRef.current,
        HEADING_SMOOTHING_FACTOR,
      );
      setHeading(smoothedHeadingRef.current);
    }

    function clearStaleTimeout() {
      if (staleTimeoutRef.current !== null) {
        clearTimeout(staleTimeoutRef.current);
        staleTimeoutRef.current = null;
      }
    }

    function resetHeading() {
      smoothedHeadingRef.current = null;
      latestHeadingRef.current = null;
      setHeading(null);
    }

    function handleOrientation(event) {
      const nextHeading = getDeviceHeading(event, getScreenOrientationAngle());

      if (!Number.isFinite(nextHeading)) {
        clearStaleTimeout();
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        resetHeading();
        return;
      }

      latestHeadingRef.current = nextHeading;
      clearStaleTimeout();
      staleTimeoutRef.current = setTimeout(resetHeading, HEADING_STALE_TIMEOUT_MS);
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(updateRenderedHeading);
      }
    }

    window.addEventListener(eventName, handleOrientation, true);
    return () => {
      window.removeEventListener(eventName, handleOrientation, true);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      clearStaleTimeout();
      smoothedHeadingRef.current = null;
      latestHeadingRef.current = null;
    };
  }, [permissionState]);

  return {
    heading,
    permissionState,
    requestPermission,
    needsPermission: permissionState === 'required'
      || permissionState === 'requesting'
      || permissionState === 'denied',
  };
}
