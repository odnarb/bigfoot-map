import { useRef, useEffect, useCallback } from 'react';
import { GiFootprint } from 'react-icons/gi';
import { IoVideocamSharp, IoVolumeHigh, IoCamera, IoEye } from 'react-icons/io5';
import { MdOpenInFull, MdCloseFullscreen } from 'react-icons/md';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useTheme } from '@mui/material/styles';
import { SightingDetails } from './SightingDetails';
import BFSilohuette from '../../assets/bf-silohuette.svg?react';

import '../../assets/sighting-marker.css';

/**
 * Returns marker icon color based on age and current theme mode.
 *
 * @param {'modern' | 'legacy'} ageRole - Marker age role.
 * @param {'light' | 'dark'} paletteMode - Theme palette mode.
 * @returns {string} Marker color.
 */
function getMarkerColor(ageRole, paletteMode) {
  if (ageRole === 'legacy') {
    return paletteMode === 'dark' ? '#6b7280' : '#4b5563';
  }

  return paletteMode === 'dark' ? '#9be882' : '#1f8f59';
}

/**
 * Renders one map marker with popup details.
 *
 * @param {{
 *  marker: Record<string, any>,
 *  isSelected: boolean,
 *  isMaximized: boolean,
 *  onSelect: () => void,
 *  onClose: () => void,
 *  onToggleMaximize: () => void,
 *  onVoteUp: () => void,
 *  onVoteDown: () => void,
 *  registerMarkerInstance: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void
 * }} props - Marker props.
 * @returns {JSX.Element} Marker and popup.
 */
export default function SightingMarker({
  marker,
  isSelected,
  isMaximized,
  onSelect,
  onClose,
  onToggleMaximize,
  onVoteUp,
  onVoteDown,
  registerMarkerInstance,
}) {
  const lastInstanceRef = useRef(null);
  const theme = useTheme();
  const markerColor = getMarkerColor(marker.ageRole, theme.palette.mode);

  const handleMarkerRef = useCallback(
    (instance) => {
      if (lastInstanceRef.current === instance) {
        return;
      }

      lastInstanceRef.current = instance;
      registerMarkerInstance(marker.id, instance || null);
    },
    [marker.id, registerMarkerInstance],
  );

  useEffect(() => {
    return () => registerMarkerInstance(marker.id, null);
  }, [marker.id, registerMarkerInstance]);

  return (
    <AdvancedMarker
      ref={handleMarkerRef}
      position={marker.position}
      onClick={(event) => {
        event?.domEvent?.stopPropagation?.();
        onSelect?.();
      }}
      zIndex={isSelected ? 999 : 1}
      title={marker.title ?? 'Report'}
    >
      <div className={`bf-marker-icon ${isSelected ? 'selected' : ''}`}>
        {marker.type === 'video' && <IoVideocamSharp size="1.5em" color={markerColor} />}
        {marker.type === 'audio' && <IoVolumeHigh size="1.5em" color={markerColor} />}
        {marker.type === 'photo' && <IoCamera size="1.5em" color={markerColor} />}
        {marker.type === 'sighting' && <IoEye size="1.5em" color={markerColor} />}
        {marker.type === 'footprint' && <GiFootprint size="1.5em" color={markerColor} />}
        {(!marker.type || marker.type === '') && (
          <BFSilohuette
            alt=""
            draggable={false}
            className="bf-icon"
            style={{ color: markerColor, userSelect: 'none', pointerEvents: 'none' }}
          />
        )}
      </div>

      {isSelected && (
        <div
          className={`bf-bubble ${isMaximized ? 'bf-bubble-maximized' : ''}`}
          onClick={(event) => event?.stopPropagation?.()}
        >
          <div className="bf-bubble-actions">
            <button
              className="bf-bubble-close"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleMaximize?.();
              }}
              aria-label={isMaximized ? 'Minimize popup' : 'Maximize popup'}
              title={isMaximized ? 'Minimize popup' : 'Maximize popup'}
            >
              {isMaximized ? <MdCloseFullscreen size={18} /> : <MdOpenInFull size={18} />}
            </button>
            <button
              className="bf-bubble-close bf-bubble-close-right"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose?.();
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <SightingDetails marker={marker} showExtended />

          <div className="vote-row">
            <button className="vote-button" onClick={onVoteUp}>👍</button>
            <button className="vote-button" onClick={onVoteDown}>👎</button>
          </div>

          {!isMaximized && <div className="bf-bubble-tip" />}
        </div>
      )}
    </AdvancedMarker>
  );
}
