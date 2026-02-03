import React, { useMemo, useState, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api"
import { Map, APIProvider } from "@vis.gl/react-google-maps"

import BFROReportsByState from '../../data/BFRO/BFRO-reports-states-map.json'
import StatePolygonsMap from '../../data/US-States-Polygons-Map.json'

import { BFMarker } from "./components/BFMarker"
import StatePolygonsLayer from "./components/StatePolygonsLayer";

const mapStyle = {
  width: "100%",
  height: '800px',
}

const mapCenter = {
  lat: 37.09024,
  lng: -95.712891
}

function GoogleMaps() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [activeState, setActiveState] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  const allStates = useMemo(() => Object.keys(StatePolygonsMap).sort(), []);

  const markers = useMemo(() => {
    if (!activeState) return [];
    const reports = BFROReportsByState[activeState] || [];
    return reports.slice(0, 100).map((r) => {
      const { bfroReportId, name, sightingClass, timestamp, url, position, source } = r;
      return {
        id: bfroReportId,
        position,
        title: name,
        info: `${name}<br />
          class: ${sightingClass}<br />
          date: ${timestamp}<br />
          source: ${source}<br />
          url: <a target="_blank" href="${url}">${url}</a>`,
      };
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
            mapId={'e0540ff806c06586'}
            style={mapStyle}
            reuseMaps
            defaultCenter={mapCenter}
            defaultZoom={5}
            onLoad={(map) => map.current = map}
            gestureHandling={"greedy"}
          >

            <StatePolygonsLayer StatePolygonsMap={StatePolygonsMap} activeState={activeState} onToggleState={toggleState} />

            {markers.map(marker => (
              <BFMarker
                key={marker.id}
                marker={marker}
                isSelected={selectedMarkerId === marker.id}
                onSelect={() => handleMarkerClick(marker.id)}
              />
            ))}
          </Map>
        </div>
      </APIProvider>
    </div>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
