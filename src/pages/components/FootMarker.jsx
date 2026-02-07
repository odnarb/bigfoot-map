import React from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { SightingDetails } from "./SightingDetails";

import '../../assets/sighting-marker.css';

export default function FootMarker({ marker, isSelected, onSelect, onClose }) {
  const size = marker.iconSize ?? 28;
  const iconUrl = marker.iconUrl ?? "/src/assets/favicon.png";

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
        <img
          src={iconUrl}
          alt=""
          draggable={false}
          className="bf-marker-icon"
          style={{
            width: size,
            height: size,
            userSelect: "none",
            pointerEvents: "none", // IMPORTANT: hover/click handled by wrapper
          }}
        />
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