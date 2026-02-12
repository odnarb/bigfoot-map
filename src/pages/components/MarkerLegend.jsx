import { IoVideocamSharp, IoVolumeHigh, IoCamera, IoEye } from 'react-icons/io5';
import { GiFootprint } from 'react-icons/gi';
import BFSilohuette from '../../assets/bf-silohuette.svg?react';
import '../../assets/sighting-marker.css';

/**
 * Renders marker legend with dataset visibility status.
 *
 * @param {{ datasetVisibility?: Record<string, boolean> }} props - Component props.
 * @returns {JSX.Element} Legend UI.
 */
export default function MarkerLegend({ datasetVisibility = { bfro: true, woodape: true, kilmury: true } }) {
  const legendItems = [
    { label: 'Video evidence', icon: <IoVideocamSharp size="1.3em" /> },
    { label: 'Audio encounter', icon: <IoVolumeHigh size="1.3em" /> },
    { label: 'Photographic evidence', icon: <IoCamera size="1.3em" /> },
    { label: 'Visual sighting', icon: <IoEye size="1.3em" /> },
    { label: 'Footprint / physical trace', icon: <GiFootprint size="1.3em" /> },
    { label: 'Unknown type', icon: <BFSilohuette className="bf-icon" /> },
  ];

  return (
    <div className="marker-legend">
      <h4>Legend</h4>

      <div className="legend-chip-row">
        <span className="legend-chip modern">Modern</span>
        <span className="legend-chip legacy">Legacy</span>
      </div>

      <div className="legend-datasets">
        <p>Active datasets:</p>
        <ul>
          <li>{datasetVisibility.bfro ? 'BFRO' : 'BFRO (hidden)'}</li>
          <li>{datasetVisibility.woodape ? 'Woodape' : 'Woodape (hidden)'}</li>
          <li>{datasetVisibility.kilmury ? 'Kilmury' : 'Kilmury (hidden)'}</li>
        </ul>
      </div>

      <div className="legend-icon-list">
        {legendItems.map((item) => (
          <div className="legend-icon-row" key={item.label}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <p className="legend-api-note">Public API docs planned.</p>
    </div>
  );
}
