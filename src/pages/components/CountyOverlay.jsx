import { useMemo } from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';

/**
 * Groups reports by county and returns centroid data.
 *
 * @param {Array<Record<string, any>>} reports - Report list with county + coordinates.
 * @returns {Array<{ id: string, countyName: string, count: number, position: {lat: number, lng: number} }>} County cluster overlays.
 */
function buildCountyClusters(reports) {
  const groupedByCounty = new Map();

  for (const report of reports) {
    if (!report.position || !report.countyName) {
      continue;
    }

    const countyKey = `${report.countryCode || 'US'}_${report.stateCode || 'NA'}_${report.countyName}`;
    const existingCounty = groupedByCounty.get(countyKey) || {
      id: countyKey,
      countyName: report.countyName,
      count: 0,
      latSum: 0,
      lngSum: 0,
    };

    existingCounty.count += 1;
    existingCounty.latSum += Number(report.position.lat);
    existingCounty.lngSum += Number(report.position.lng);
    groupedByCounty.set(countyKey, existingCounty);
  }

  return Array.from(groupedByCounty.values()).map((entry) => ({
    id: entry.id,
    countyName: entry.countyName,
    count: entry.count,
    position: {
      lat: entry.latSum / entry.count,
      lng: entry.lngSum / entry.count,
    },
  }));
}

/**
 * Renders county activity overlay markers.
 *
 * @param {{ reports: Array<Record<string, any>>, isEnabled: boolean }} props - Component props.
 * @returns {JSX.Element | null} County overlay markers.
 */
export default function CountyOverlay({ reports, isEnabled }) {
  const countyClusters = useMemo(() => buildCountyClusters(reports), [reports]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {countyClusters.map((cluster) => (
        <AdvancedMarker key={cluster.id} position={cluster.position} zIndex={2}>
          <div className="county-overlay-chip">
            <strong>{cluster.countyName}</strong>
            <span>{cluster.count}</span>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}
