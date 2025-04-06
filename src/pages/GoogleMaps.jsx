import React, { useState } from "react"
import { useJsApiLoader  } from "@react-google-maps/api"
import { Map, APIProvider } from "@vis.gl/react-google-maps"

import BFROReports from '../../data/BFRO/BFRO-Reports.json'
import { BFROMarker } from "./components/BFROMarker"

const mapContainerStyle = {
  width: "100%",
  height: '100%',
}

const mapCenter = {
  lat: 37.09024,
  lng: -95.712891
}

const generateBFROMarkers = () => {
  const markers = [];
  for (const report of BFROReports) {
   const { bfroReportId, name, sightingClass, timestamp, url, position, source } = report

   //TODO: this is only for testing..
   if(markers.length > 10) {
    return markers
   }

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

function GoogleMaps() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [markers] = useState(generateBFROMarkers);

  return isLoaded ? (
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['marker']}
      >
        <div id="map-container">
          <Map
            style={mapContainerStyle}
            mapId={'e0540ff806c06586'}
            reuseMaps
            defaultCenter={mapCenter}
            defaultZoom={5}
            onLoad={(map) => map.current = map}
            gestureHandling={"greedy"}
          >
            {markers.map(marker => (
              <BFROMarker
                key={marker.id}
                marker={marker}
              />
            ))}
          </Map>
        </div>
      </APIProvider>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
