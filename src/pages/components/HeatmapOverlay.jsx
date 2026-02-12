import { useEffect, useMemo, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';

/**
 * Renders a deck.gl heatmap overlay on top of Google Maps.
 *
 * @param {{
 *   isEnabled: boolean,
 *   points: Array<{ position: { lat: number, lng: number }, weight?: number }>
 * }} props - Component props.
 * @returns {null} Overlay-only component.
 */
export default function HeatmapOverlay({ isEnabled, points }) {
  const map = useMap();
  const overlayRef = useRef(null);
  const isCypressRuntime = typeof window !== 'undefined' && Boolean(window.Cypress);

  if (isCypressRuntime) {
    return null;
  }

  const layer = useMemo(() => {
    if (!isEnabled || !points?.length) {
      return null;
    }

    return new HeatmapLayer({
      id: 'sighting-heatmap-layer',
      data: points,
      getPosition: (point) => [point.position.lng, point.position.lat],
      getWeight: (point) => Number(point.weight || 1),
      radiusPixels: 70,
      intensity: 0.85,
      threshold: 0.04,
      colorRange: [
        [31, 86, 71, 35],
        [58, 118, 76, 85],
        [120, 160, 66, 140],
        [191, 173, 52, 190],
        [230, 122, 43, 230],
        [209, 68, 37, 255],
      ],
    });
  }, [isEnabled, points]);

  useEffect(() => {
    if (!map || typeof map.addListener !== 'function') {
      return undefined;
    }

    if (!overlayRef.current) {
      try {
        overlayRef.current = new GoogleMapsOverlay({ layers: [] });
        overlayRef.current.setMap(map);
      } catch (_error) {
        overlayRef.current = null;
        return undefined;
      }
    }

    if (overlayRef.current) {
      overlayRef.current.setProps({
        layers: layer ? [layer] : [],
      });
    }

    return () => {};
  }, [map, layer]);

  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current.finalize();
        overlayRef.current = null;
      }
    };
  }, []);

  return null;
}
