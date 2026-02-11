import { useState, useEffect } from "react";

import { useMap } from "@vis.gl/react-google-maps"

/** Imperative polygon layer for vis.gl: creates google.maps.Polygon for each state. */
export default function StatePolygonsLayer({ StatePolygonsMap, activeState, onToggleState, setSelectedMarkerId }) {
    const map = useMap(); // current Google Map instance from vis.gl
    const [polysByState, setPolysByState] = useState({}); // abbrev -> google.maps.Polygon[]

    /** Convert GeoJSON coords (lon,lat) to Google paths [{lat,lng},...] for each polygon's outer ring. */
    function toPolygonPaths(coords) {
        if (!Array.isArray(coords)) return [];
        const isMulti = Array.isArray(coords[0]?.[0]?.[0]); // MultiPolygon if true
        const polys = isMulti ? coords : [coords];
        // Only outer ring (index 0). If you want holes, loop rings and pass as "paths: [outer, hole1, hole2,...]"
        return polys.map((poly) => (poly[0] || []).map(([lng, lat]) => ({ lat, lng })));
    }

    // Build polygons once (on mount)
    useEffect(() => {
        if (!map || !window.google) return;

        const created = {};

        for (const [abbrev, coords] of Object.entries(StatePolygonsMap)) {
            const rings = toPolygonPaths(coords);
            const polyObjs = rings.map((path) => {
                const poly = new google.maps.Polygon({
                    paths: path,
                    strokeOpacity: 0.2,
                    strokeWeight: 1,
                    fillOpacity: 0.05,
                    clickable: true,
                    map,
                });
                // click toggles activeState
                poly.addListener("click", () => {
                    onToggleState(abbrev)
                    setSelectedMarkerId(null)
                });
                return poly;
            });
            created[abbrev] = polyObjs;
        }

        setPolysByState(created);

        // cleanup on unmount
        return () => {
            for (const arr of Object.values(created)) {
                arr.forEach((p) => p.setMap(null));
            }
        };
    }, [map, onToggleState]);

    // Style update when activeState changes
    useEffect(() => {
        for (const [abbrev, arr] of Object.entries(polysByState)) {
            const isActive = activeState === abbrev;
            arr.forEach((p) =>
                p.setOptions({
                    strokeOpacity: isActive ? 0.9 : 0.3,
                    strokeWeight: isActive ? 2 : 1,
                    fillOpacity: isActive ? 0.2 : 0.05,
                })
            );
        }
    }, [activeState, polysByState]);

    return null; // this component only manages native polygons
}