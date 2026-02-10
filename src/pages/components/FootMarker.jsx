import React from "react";
import { GiFootprint } from "react-icons/gi";
import { IoVideocamSharp, IoVolumeHigh, IoCamera, IoEye } from "react-icons/io5";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { SightingDetails } from "./SightingDetails";

import '../../assets/sighting-marker.css';

export default function FootMarker({ marker, isSelected, onSelect, onClose }) {
  return (
    <AdvancedMarker
      position={marker.position}
      onClick={(e) => {
        e?.domEvent?.stopPropagation?.();
        onSelect?.();
      }}
      zIndex={isSelected ? 999 : 1}
      title={marker.title ?? "Report"}
    >
      <div className={`bf-marker-wrap ${isSelected ? "selected" : ""}`}>
        {marker.type === "video" && <IoVideocamSharp size={'1.5em'} />}
        {marker.type === "audio" && <IoVolumeHigh size={'1.5em'} />}
        {marker.type === "photo" && <IoCamera size={'1.5em'} />}
        {marker.type === "sighting" && <IoEye size={'1.5em'} />}
        {marker.type === "footprint" && <GiFootprint size={'1.5em'} />}
        {!marker.type && (<img
          src={"/src/assets/bf-silohuette.png"}
          alt=""
          draggable={false}
          style={{
            width: 16,
            userSelect: "none",
            pointerEvents: "none", // IMPORTANT: hover/click handled by wrapper
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