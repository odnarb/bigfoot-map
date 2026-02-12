import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useOutletContext } from 'react-router';

import { DateTime } from "luxon";
import { Paper, Typography } from '@mui/material';

import { useJsApiLoader } from "@react-google-maps/api";
import { Map, APIProvider, useMap } from "@vis.gl/react-google-maps";

import { MarkerClusterer } from "@googlemaps/markerclusterer";

import BFROReportsByState from '../../data/BFRO-reports-states-map.json'
// import BFROReports from  '../../data/BFRO-Reports.json'

import StatePolygonsMap from '../../data/US-States-Polygons-Map.json'
import StatePolygonsLayer from "./components/StatePolygonsLayer";
import SightingMarker from "./components/SightingMarker";
import DateRangeFilter from './components/DateRangeFilter';

const mapStyle = {
  width: "100%",
  height: "100%",
};

const mapCenter = {
  lat: 37.09024,
  lng: -95.712891
}

const thisYear = DateTime.now().year;

function lowerBound(arr, targetTs) {
  let low = 0;
  let high = arr.length;

  while (low < high) {
    const mid = (low + high) >> 1;
    if (arr[mid].timestamp < targetTs) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function upperBound(arr, targetTs) {
  let low = 0;
  let high = arr.length;

  while (low < high) {
    const mid = (low + high) >> 1;
    if (arr[mid].timestamp <= targetTs) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

// Helper component so we can use useMap() (must be inside <Map> tree)
function ClusterController({ markerInstances }) {
  const map = useMap();
  const clustererRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!map) return;

    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }

    const clusterer = clustererRef.current;

    // cancel any pending rebuild
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // rebuild next frame (keeps UI responsive)
    rafRef.current = requestAnimationFrame(() => {
      clusterer.clearMarkers();
      clusterer.addMarkers(markerInstances);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [map, markerInstances]);

  return null;
}

export default function GoogleMaps() {
  const MIN_DATE_YEAR = 1800;
  const MAX_DATE_YEAR = DateTime.now().year;

  const initialRange = [DateTime.now().year - 10, MAX_DATE_YEAR];
  const [appliedDateRange, setAppliedDateRange] = useState(initialRange);
  const [minYear, maxYear] = appliedDateRange;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [activeState, setActiveState] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  // IMPORTANT: don't call `new Map()` here (it collides with your imported <Map /> component)
  // Use globalThis.Map (or rename your imported Map to GoogleMap)
  const markerMapRef = useRef(new globalThis.Map());

  const [markerTick, setMarkerTick] = useState(0);

  const reports = useMemo(() => {
    // if no state selected, show nothing (or swap to "show all" behavior below)
    if (!activeState) return [];

    const stateRows = BFROReportsByState?.[activeState] ?? [];

    return stateRows.map((r) => {
      const { bfroReportId, name, sightingClass, timestamp, url, position, source } = r;

      const ts = new Date(timestamp).getTime();

      const marker = {
        id: bfroReportId,
        position,
        title: name,
        timestamp: ts,
        info: `${name}<br />
          class: ${sightingClass}<br />
          date: ${timestamp}<br />
          source: ${source}<br />
          url: <a target="_blank" href="${url}">${url}</a>`,
      };

      const dateTime = DateTime.fromMillis(ts);
      if (!dateTime.invalid) {
        marker.legacy = thisYear - dateTime.year > 10;
      }

      return marker;
    });
  }, [activeState]);


  const registerMarkerInstance = useCallback((id, instanceOrNull) => {
    const m = markerMapRef.current;

    if (!instanceOrNull) m.delete(id);
    else m.set(id, instanceOrNull);

    // trigger recompute for markerInstances
    setMarkerTick((x) => x + 1);
  }, []);

  const minTs = useMemo(() => {
    return DateTime.fromObject({ year: minYear }).toMillis();
  }, [minYear]);

  const maxTs = useMemo(() => {
    return DateTime.fromObject({ year: maxYear, month: 12, day: 31 }).toMillis();
  }, [maxYear]);

  const markerInstances = useMemo(() => {
    return Array.from(markerMapRef.current.values());
  }, [markerTick]);

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => a.timestamp - b.timestamp);
  }, [reports]);

  const markers = useMemo(() => {
    const left = lowerBound(sortedReports, minTs);
    const right = upperBound(sortedReports, maxTs);

    return sortedReports.slice(left, right);
  }, [sortedReports, minTs, maxTs]);

  const handleMarkerClick = useCallback(
    (id) => setSelectedMarkerId((prev) => (prev === id ? null : id)),
    []
  );

  const toggleState = useCallback((abbrev) => {
    setSelectedMarkerId(null);
    setActiveState((prev) => (prev === abbrev ? null : abbrev));
  }, []);
  
  return isLoaded ? (
    <div className="advanced-marker">
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['marker']}
      >
        <div id="map-container" style={{ position: 'relative' }}>
          <Map
            mapTypeControlOptions={{ style: google.maps.MapTypeControlStyle.DROPDOWN_MENU }}
            mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
            style={mapStyle}
            reuseMaps
            defaultCenter={mapCenter}
            defaultZoom={5}
            colorScheme="LIGHT"
            onClick={() => setSelectedMarkerId(null)}
            gestureHandling={"greedy"}
            lazy
          >
            <StatePolygonsLayer StatePolygonsMap={StatePolygonsMap} activeState={activeState} onToggleState={toggleState} setSelectedMarkerId={setSelectedMarkerId} />

            {markers.map(marker => (
              <SightingMarker
                key={marker.id}
                marker={marker}
                isSelected={selectedMarkerId === marker.id}
                onSelect={() => handleMarkerClick(marker.id)}
                onClose={() => setSelectedMarkerId(null)}
                registerMarkerInstance={registerMarkerInstance}
              />
            ))}

            <ClusterController markerInstances={markerInstances} />
          </Map>

          {/* FLOATING DATE FILTER */}
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              p: 1.5,
              backdropFilter: 'blur(6px)',
              backgroundColor: 'rgba(30,30,30,0.85)',
              color: 'white',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                px: 2,
                pb: 0.5,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 1,
              }}
            >
              Report Date Range
            </Typography>

            <DateRangeFilter
              min={MIN_DATE_YEAR}
              max={MAX_DATE_YEAR}
              dateRange={appliedDateRange}
              onChangeCommitted={setAppliedDateRange}
              />
          </Paper>
        </div>
      </APIProvider>
    </div>
  ) : <p>Loading Map...</p>;
};