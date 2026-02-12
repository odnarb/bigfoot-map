import { useRef, useEffect, useCallback } from "react";
import { GiFootprint } from "react-icons/gi";
import { IoVideocamSharp, IoVolumeHigh, IoCamera, IoEye } from "react-icons/io5";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { SightingDetails } from "./SightingDetails";
import BFSilohuette from "../../assets/bf-silohuette.svg?react";

import '../../assets/sighting-marker.css';

export default function SightingMarker({ marker, isSelected, onSelect, onClose, registerMarkerInstance }) {
  const lastInstanceRef = useRef(null);

  const handleMarkerRef = useCallback(
    (instance) => {
      // instance is the underlying AdvancedMarkerElement (or null)
      if (lastInstanceRef.current === instance) return;

      lastInstanceRef.current = instance;
      registerMarkerInstance(marker.id, instance || null);
    },
    [marker.id, registerMarkerInstance]
  );

  // Ensure we unregister on unmount
  useEffect(() => {
    return () => registerMarkerInstance(marker.id, null);
  }, [marker.id, registerMarkerInstance]);

  return (
    <AdvancedMarker
      ref={handleMarkerRef}
      position={marker.position}
      onClick={(e) => {
        e?.domEvent?.stopPropagation?.();
        onSelect?.();
      }}
      zIndex={isSelected ? 999 : 1}
      title={marker.title ?? "Report"}
    >
      <div className={`bf-marker-icon ${isSelected ? "selected" : ""}`}>
        {marker.type === "video" && <IoVideocamSharp size={'1.5em'} color={marker.legacy ? "#3a3a3a" : "#00ff73"} />}
        {marker.type === "audio" && <IoVolumeHigh size={'1.5em'} color={marker.legacy ? "#3a3a3a" : "#00ff73"} />}
        {marker.type === "photo" && <IoCamera size={'1.5em'} color={marker.legacy ? "#3a3a3a" : "#00ff73"} />}
        {marker.type === "sighting" && <IoEye size={'1.5em'} color={marker.legacy ? "#3a3a3a" : "#00ff73"} />}
        {marker.type === "footprint" && <GiFootprint size={'1.5em'} color={marker.legacy ? "#3a3a3a" : "#00ff73"} />}
        {(!marker.type || marker.type === "") && (<BFSilohuette
          alt=""
          draggable={false}
          className="bf-icon"
          style={{
            color: marker.legacy ? "#3a3a3a" : "#00ff73",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />)}
      </div>

      {/* Details bubble (only when selected) */}
      {isSelected && (
        <div
          className="bf-bubble"
          onClick={(e) => e?.stopPropagation?.()} // keep clicks inside from closing
        >
          <button
            className="bf-bubble-close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <SightingDetails marker={marker} isExtended />

          <div className="bf-bubble-tip" />
        </div>
      )}
    </AdvancedMarker>
  );
}