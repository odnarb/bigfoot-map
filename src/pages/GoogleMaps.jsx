import React, { useState } from "react"
// import { GoogleMap, useJsApiLoader, Marker, InfoWindow  } from "@react-google-maps/api"

import { GoogleMap, useJsApiLoader, InfoWindow  } from "@react-google-maps/api"
import { Map, AdvancedMarker, APIProvider, Pin } from "@vis.gl/react-google-maps"

import BFROReports from '../../data/BFRO/BFRO-Reports.json'
import { BFROMarker } from "./components/BFROMarker"

const containerStyle = {
  width: "100%",
  height: '800px',
}

const mapOptions = {
  mapId: "e0540ff806c06586",
  gestureHandling: "greedy"
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
    // const reportDateTime = DateTime.fromISO(timestamp)
    // if(reportDateTime.year === 2025) 
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
    <div className="advanced-marker">
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={['marker']}
    >
      <div id="map-container">
      <Map
        mapContainerStyle={containerStyle}
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
      </div>
  ) : <p>Loading Map...</p>;
};

export default GoogleMaps;
