import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

import BFROReports from '../../data/BFRO/BFRO-Reports.json'

const containerStyle = {
  width: "100%",
  height: '800px',
}

const center = {
  lat: 37.09024,
  lng: -95.712891
}

// Generate 10 random coordinates within the continental US
const generateRandomMarkers = () => {
  const markers = [];
  for (const report of BFROReports) {
    // if(markers.length > 50) {
    //   return markers
    // }
   const { bfroReportId, name, sightingClass, timestamp, url, position, source } = report
    markers.push({
      id: bfroReportId,
      position,
      info: `${name}<br />
        class: ${sightingClass}<br />
        date: ${timestamp}<br />
        source: ${source}<br />
        url: <a targe="_blank" href="${url}">${url}</a>`
    });
  }
  return markers;
};


function GoogleMaps() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });


  const [map, setMap] = useState(null);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers] = useState(generateRandomMarkers);

  const onLoad = useCallback(map => {
    setMap(map)
  }, []);

  const onUnmount = useCallback(map => {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={4}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={marker.position}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <h4>{selectedMarker.info}</h4>
            <p>Lat: {selectedMarker.position.lat.toFixed(4)}</p>
            <p>Lng: {selectedMarker.position.lng.toFixed(4)}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
