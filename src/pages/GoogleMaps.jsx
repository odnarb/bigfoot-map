import React, { useMemo, useState, useCallback } from "react";
import { DateTime } from "luxon";
import { useJsApiLoader } from "@react-google-maps/api"
import { Map, APIProvider } from "@vis.gl/react-google-maps"

import BFROReportsByState from '../../data/BFRO-reports-states-map.json'
import StatePolygonsMap from '../../data/US-States-Polygons-Map.json'

import StatePolygonsLayer from "./components/StatePolygonsLayer";
import FootMarker from "./components/FootMarker";

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
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [activeState, setActiveState] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  const markers = useMemo(() => {
    if (!activeState) return [];
    const reports = BFROReportsByState[activeState] || [];
    return reports.map((r) => {
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
  }, [activeState]);

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
        <div id="map-container">
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
            lazy={true}
          >

            <StatePolygonsLayer StatePolygonsMap={StatePolygonsMap} activeState={activeState} onToggleState={toggleState} setSelectedMarkerId={setSelectedMarkerId} />

            {markers.map(marker => (
              <FootMarker
                key={marker.id}
                marker={marker}
                isSelected={selectedMarkerId === marker.id}
                onSelect={() => handleMarkerClick(marker.id)}
                onClose={() => setSelectedMarkerId(null)}
              />
            ))}
          </Map>
        </div>
      </APIProvider>
    </div>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
