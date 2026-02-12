import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useDispatch, useSelector } from 'react-redux';
import { useGetReportsQuery, useVoteOnReportMutation } from '../store/services/reportApi';
import {
  setDatasetVisibility,
  setShowCountyOverlay,
  setShowHeatmap,
  setSplitViewEnabled,
} from '../store/slices/mapUiSlice';
import {
  boundsToQueryValue,
  getMarkerAgeRole,
  isReportInsideBounds,
  normalizeBfroReports,
  normalizeKilmuryReports,
  normalizeWoodapeReports,
} from '../utils/reportDataUtils';
import { exportReportsAsCsv, exportReportsAsGeoJson } from '../utils/exportDataUtils';
import BFROReportsByState from '../../data/BFRO-reports-states-map.json';
import WoodapeReports from '../../data/woodape.org.json';
import KilmuryReports from '../../data/Bobbie-Short-sightings-catalog.json';
import StatePolygonsMap from '../../data/US-States-Polygons-Map.json';
import CountyOverlay from './components/CountyOverlay';
import HeatmapOverlay from './components/HeatmapOverlay';
import MapControlsPanel from './components/MapControlsPanel';
import ReportListPanel from './components/ReportListPanel';
import SightingMarker from './components/SightingMarker';
import StatePolygonsLayer from './components/StatePolygonsLayer';

const mapStyle = { width: '100%', height: '100%' };
const mapCenter = { lat: 39.5, lng: -98.35 };
const thisYear = DateTime.now().year;

/**
 * Controls marker clustering for visible markers.
 *
 * @param {{ markerInstances: Array<google.maps.marker.AdvancedMarkerElement> }} props - Component props.
 * @returns {null} Overlay-only component.
 */
function ClusterController({ markerInstances }) {
  const map = useMap();
  const clustererRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }

    const clusterer = clustererRef.current;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      clusterer.clearMarkers();
      clusterer.addMarkers(markerInstances);
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [map, markerInstances]);

  return null;
}

/**
 * Emits map bounds updates from Google Maps events.
 *
 * @param {{ onBoundsChange: (bounds: {south: number, west: number, north: number, east: number} | null) => void }} props - Component props.
 * @returns {null} Effect-only component.
 */
function MapBoundsListener({ onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return undefined;
    }

    const emitBounds = () => {
      const mapBounds = map.getBounds();
      if (!mapBounds) {
        onBoundsChange(null);
        return;
      }

      const northEast = mapBounds.getNorthEast();
      const southWest = mapBounds.getSouthWest();
      onBoundsChange({
        north: northEast.lat(),
        east: northEast.lng(),
        south: southWest.lat(),
        west: southWest.lng(),
      });
    };

    emitBounds();
    const listener = map.addListener('idle', emitBounds);
    return () => listener.remove();
  }, [map, onBoundsChange]);

  return null;
}

/**
 * Focuses map camera when a report is selected from list view.
 *
 * @param {{ focusTarget: { lat: number, lng: number } | null }} props - Component props.
 * @returns {null} Effect-only component.
 */
function MapFocusController({ focusTarget }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !focusTarget) {
      return;
    }

    map.panTo(focusTarget);
    map.setZoom(Math.max(6, map.getZoom() || 7));
  }, [map, focusTarget]);

  return null;
}

/**
 * Creates client-friendly report shape from API/local source rows.
 *
 * @param {Array<Record<string, any>>} reports - Source report list.
 * @returns {Array<Record<string, any>>} Enriched report list.
 */
function enrichReports(reports) {
  return reports.map((report) => ({
    ...report,
    ageRole: getMarkerAgeRole(report.timestampMs),
    votes: report.votes || { up: 0, down: 0, byUser: {} },
    triage: report.triage || {
      status: 'new',
      tier: 'unreviewed',
      minimumInfoComplete: Boolean(report.title && report.summary),
      followedUpBy: null,
      statusHistory: [],
    },
  }));
}

/**
 * Main map page.
 *
 * @returns {JSX.Element} Map UI.
 */
export default function GoogleMaps() {
  const dispatch = useDispatch();
  const datasetVisibility = useSelector((state) => state.mapUi.datasetVisibility);
  const showHeatmap = useSelector((state) => state.mapUi.showHeatmap);
  const showCountyOverlay = useSelector((state) => state.mapUi.showCountyOverlay);
  const splitViewEnabled = useSelector((state) => state.mapUi.splitViewEnabled);
  const colorMode = useSelector((state) => state.mapUi.colorMode);

  const [yearRange, setYearRange] = useState([thisYear - 20, thisYear]);
  const [timelineYear, setTimelineYear] = useState(thisYear);
  const [activeState, setActiveState] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [maximizedMarkerId, setMaximizedMarkerId] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [clientId, setClientId] = useState('anonymous-client');
  const [toastMessage, setToastMessage] = useState('');
  const [fallbackVoteState, setFallbackVoteState] = useState({});

  const markerMapRef = useRef(new globalThis.Map());
  const [markerTick, setMarkerTick] = useState(0);
  const [voteOnReport] = useVoteOnReportMutation();

  const enabledDatasets = useMemo(
    () => Object.entries(datasetVisibility).filter(([, visible]) => visible).map(([datasetKey]) => datasetKey),
    [datasetVisibility],
  );

  const reportsQueryFilters = useMemo(() => ({
    datasets: enabledDatasets,
    fromYear: yearRange[0],
    toYear: yearRange[1],
    bounds: boundsToQueryValue(mapBounds),
    includeWithoutCoordinates: true,
  }), [enabledDatasets, yearRange, mapBounds]);

  const reportsQuery = useGetReportsQuery(reportsQueryFilters);

  const localReports = useMemo(() => {
    const flattened = [
      ...normalizeBfroReports(BFROReportsByState),
      ...normalizeWoodapeReports(WoodapeReports),
      ...normalizeKilmuryReports(KilmuryReports),
    ];

    return enrichReports(flattened);
  }, []);

  const apiReports = useMemo(() => {
    if (!reportsQuery.data?.reports) {
      return [];
    }

    return enrichReports(reportsQuery.data.reports);
  }, [reportsQuery.data]);

  const sourceReports = apiReports.length > 0 ? apiReports : localReports;
  const fromTimestampMs = Date.UTC(yearRange[0], 0, 1, 0, 0, 0, 0);
  const toTimestampMs = Date.UTC(yearRange[1], 11, 31, 23, 59, 59, 999);
  const timelineTimestampMs = Date.UTC(timelineYear, 11, 31, 23, 59, 59, 999);

  const filteredReports = useMemo(() => {
    return sourceReports
      .filter((report) => enabledDatasets.includes(report.datasetKey))
      .filter((report) => !activeState || report.stateCode === activeState)
      .filter((report) => report.timestampMs >= fromTimestampMs && report.timestampMs <= toTimestampMs)
      .filter((report) => report.timestampMs <= timelineTimestampMs)
      .sort((left, right) => right.timestampMs - left.timestampMs);
  }, [sourceReports, enabledDatasets, activeState, fromTimestampMs, toTimestampMs, timelineTimestampMs]);

  const mapReports = useMemo(() => filteredReports.filter((report) => report.position), [filteredReports]);
  const viewportReports = useMemo(
    () => mapReports.filter((report) => isReportInsideBounds(report, mapBounds)),
    [mapReports, mapBounds],
  );

  const markerInstances = useMemo(() => Array.from(markerMapRef.current.values()), [markerTick]);

  const markerReports = useMemo(() => {
    return mapReports.map((report) => {
      const fallbackVotes = fallbackVoteState[report.id];
      if (!fallbackVotes) {
        return report;
      }

      return {
        ...report,
        votes: {
          ...report.votes,
          ...fallbackVotes,
        },
      };
    });
  }, [mapReports, fallbackVoteState]);

  const selectedReport = useMemo(
    () => markerReports.find((report) => report.id === selectedMarkerId) || null,
    [markerReports, selectedMarkerId],
  );

  useEffect(() => {
    const storedClientId = localStorage.getItem('mappingSasquatchClientId');
    if (storedClientId) {
      setClientId(storedClientId);
      return;
    }

    const generatedClientId = `client_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem('mappingSasquatchClientId', generatedClientId);
    setClientId(generatedClientId);
  }, []);

  useEffect(() => {
    if (timelineYear < yearRange[0]) {
      setTimelineYear(yearRange[0]);
    } else if (timelineYear > yearRange[1]) {
      setTimelineYear(yearRange[1]);
    }
  }, [timelineYear, yearRange]);

  const registerMarkerInstance = useCallback((id, instanceOrNull) => {
    const markerMap = markerMapRef.current;
    if (!instanceOrNull) {
      markerMap.delete(id);
    } else {
      markerMap.set(id, instanceOrNull);
    }

    setMarkerTick((value) => value + 1);
  }, []);

  const handleVote = useCallback(async (reportId, direction) => {
    try {
      await voteOnReport({ reportId, direction, clientId }).unwrap();
    } catch (_error) {
      setFallbackVoteState((previousState) => {
        const previousVotes = previousState[reportId] || { up: 0, down: 0 };
        const nextVotes = {
          up: previousVotes.up,
          down: previousVotes.down,
        };
        if (direction === 'up') {
          nextVotes.up += 1;
        } else {
          nextVotes.down += 1;
        }

        return {
          ...previousState,
          [reportId]: nextVotes,
        };
      });
      setToastMessage('Vote saved locally. API sync will retry automatically.');
    }
  }, [voteOnReport, clientId]);

  const handleSelectReport = useCallback((report) => {
    setSelectedMarkerId(report.id);
    setMaximizedMarkerId(null);
    if (report.position) {
      setFocusTarget(report.position);
    } else {
      setToastMessage('This report has no map coordinates yet.');
    }
  }, []);

  const heatmapPoints = useMemo(
    () => viewportReports.map((report) => ({
      position: report.position,
      weight: Math.max(1, Number(report.votes?.up || 0) + 1),
    })),
    [viewportReports],
  );

  const mapLoading = reportsQuery.isLoading;
  const mapTypeControlStyle = globalThis.google?.maps?.MapTypeControlStyle?.DROPDOWN_MENU;

  return (
    <Box className="maps-page">
      <MapControlsPanel
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        timelineYear={timelineYear}
        onTimelineYearChange={setTimelineYear}
        datasetVisibility={datasetVisibility}
        onToggleDataset={(datasetKey, visible) => dispatch(setDatasetVisibility({ datasetKey, visible }))}
        showHeatmap={showHeatmap}
        onToggleHeatmap={(nextValue) => dispatch(setShowHeatmap(nextValue))}
        showCountyOverlay={showCountyOverlay}
        onToggleCountyOverlay={(nextValue) => dispatch(setShowCountyOverlay(nextValue))}
        splitViewEnabled={splitViewEnabled}
        onToggleSplitView={(nextValue) => dispatch(setSplitViewEnabled(nextValue))}
        onExportCsv={() => exportReportsAsCsv(filteredReports)}
        onExportGeoJson={() => exportReportsAsGeoJson(filteredReports)}
      />

      <Box className={`maps-content ${splitViewEnabled ? 'maps-content-split' : ''}`}>
        {splitViewEnabled && (
          <ReportListPanel
            reports={filteredReports}
            selectedReportId={selectedMarkerId}
            onSelectReport={handleSelectReport}
          />
        )}

        <Box id="map-container" className="map-canvas-wrap">
          {mapLoading ? (
            <Box className="map-loading">
              <CircularProgress />
            </Box>
          ) : (
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['marker']}>
              <Map
                mapTypeControlOptions={mapTypeControlStyle
                  ? { style: mapTypeControlStyle }
                  : undefined}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                style={mapStyle}
                reuseMaps
                defaultCenter={mapCenter}
                defaultZoom={5}
                colorScheme={colorMode === 'dark' ? 'DARK' : 'LIGHT'}
                onClick={() => {
                  setSelectedMarkerId(null);
                  setMaximizedMarkerId(null);
                }}
                gestureHandling="greedy"
              >
                <MapBoundsListener onBoundsChange={setMapBounds} />
                <MapFocusController focusTarget={focusTarget} />

                <StatePolygonsLayer
                  StatePolygonsMap={StatePolygonsMap}
                  activeState={activeState}
                  onToggleState={(stateCode) => {
                    setSelectedMarkerId(null);
                    setMaximizedMarkerId(null);
                    setActiveState((previousState) => (previousState === stateCode ? null : stateCode));
                  }}
                  setSelectedMarkerId={setSelectedMarkerId}
                />

                {markerReports.map((marker) => (
                  <SightingMarker
                    key={marker.id}
                    marker={marker}
                    isSelected={selectedMarkerId === marker.id}
                    isMaximized={maximizedMarkerId === marker.id}
                    onSelect={() => setSelectedMarkerId((previousValue) => (previousValue === marker.id ? null : marker.id))}
                    onClose={() => {
                      setSelectedMarkerId(null);
                      setMaximizedMarkerId(null);
                    }}
                    onToggleMaximize={() => setMaximizedMarkerId((previousValue) => (previousValue === marker.id ? null : marker.id))}
                    onVoteUp={() => handleVote(marker.id, 'up')}
                    onVoteDown={() => handleVote(marker.id, 'down')}
                    registerMarkerInstance={registerMarkerInstance}
                  />
                ))}

                <CountyOverlay reports={viewportReports} isEnabled={showCountyOverlay} />
                <HeatmapOverlay isEnabled={showHeatmap} points={heatmapPoints} />
                <ClusterController markerInstances={markerInstances} />
              </Map>
            </APIProvider>
          )}
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3500}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage('')} severity="info" variant="filled">
          {toastMessage}
        </Alert>
      </Snackbar>

      {reportsQuery.error && (
        <Alert severity="warning" sx={{ position: 'absolute', bottom: 16, right: 16, maxWidth: 420 }}>
          Live API unavailable. Showing local dataset fallback.
        </Alert>
      )}
      {selectedReport && selectedReport.triage?.minimumInfoComplete === false && (
        <Alert severity="info" sx={{ position: 'absolute', bottom: 16, left: 16, maxWidth: 420 }}>
          Selected report needs more detail before full public vetting.
        </Alert>
      )}
    </Box>
  );
}
