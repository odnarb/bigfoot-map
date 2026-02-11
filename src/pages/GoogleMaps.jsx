import { useMemo, useState, useCallback } from "react";
import { useOutletContext } from 'react-router';

import { DateTime } from "luxon";
import {Paper, Typography} from '@mui/material';

import { useJsApiLoader } from "@react-google-maps/api"
import { Map, APIProvider } from "@vis.gl/react-google-maps"

import BFROReportsByState from '../../data/BFRO-reports-states-map.json'
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

const thisYear = DateTime.now().year

function GoogleMaps() {
    const { dateRange, setDateRange, MIN_DATE_YEAR, MAX_DATE_YEAR } = useOutletContext();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [activeState, setActiveState] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  const markers = useMemo(() => {
    if (!activeState) return [];
    const reports = BFROReportsByState[activeState] || [];
    return reports
    .filter(r => (new Date(r.timestamp)).getFullYear() > dateRange[0] )
    .map((r) => {
      const { bfroReportId, name, sightingClass, timestamp, url, position, source } = r;
      const dateTime = DateTime.fromJSDate(new Date(timestamp));

      const marker = {
        id: bfroReportId,
        position,
        title: name,
        info: `${name}<br />
          class: ${sightingClass}<br />
          date: ${timestamp}<br />
          source: ${source}<br />
          url: <a target="_blank" href="${url}">${url}</a>`,
      };

      if (!dateTime.invalid) {
        marker.legacy = thisYear - dateTime.year > 10;
      }

      return marker
    });
  }, [activeState, dateRange]);

  const handleMarkerClick = useCallback(
    (id) => setSelectedMarkerId((prev) => (prev === id ? null : id)),
    []
  );

  const toggleState = (abbrev) => setActiveState(abbrev);

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
            onLoad={(map) => map.current = map}
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
              />
            ))}
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
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Paper>
        </div>
      </APIProvider>
    </div>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
