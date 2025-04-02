import React, { useCallback, useState, useContext } from "react"
import { GoogleMap, useJsApiLoader, MapContext  } from "@react-google-maps/api"

import BFROReports from '../../data/BFRO/BFRO-Reports.json'

import { BFROMarker } from "./components/BFROMarker"
import { APIProvider } from "@vis.gl/react-google-maps"

const containerStyle = {
  width: "100%",
  height: '800px',
}

const center = {
  lat: 37.09024,
  lng: -95.712891
}

const generateBFROMarkers = () => {
  const markers = [];
  for (const report of BFROReports) {
    if(markers.length > 0) {
      return markers
    }
   const { bfroReportId, name, sightingClass, timestamp, url, position, source } = report
    markers.push({
      id: bfroReportId,
      position,
      title: name,
      info: `${name}<br />
        class: ${sightingClass}<br />
        date: ${timestamp}<br />
        source: ${source}<br />
        url: <a targe="_blank" href="${url}">${url}</a>`
    });
  }
  return markers;
};

function MapComponent() {
  const map = useMap();

  if (!map) {
    return <div>Loading map...</div>;
  }

  return <p>Map is ready.</p>;
}

function GoogleMaps() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["marker"]
  });

  const map = useContext(MapContext);


  // const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers] = useState(generateBFROMarkers);


  return isLoaded ? (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        reuseMaps
        center={center}
        zoom={4}
        onLoad={(map) => map.current = map}
        options={{ gestureHandling: "greedy" }}
      >
        {markers.map(marker => (
          <BFROMarker
            key={marker.id}
            marker={marker}
          />
        ))}
      </GoogleMap>
    </APIProvider>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
