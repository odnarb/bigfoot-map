import React from "react";
import { IoVideocamSharp, IoVolumeHigh, IoCamera, IoEye } from "react-icons/io5";
import { GiFootprint } from "react-icons/gi";
import BFSilohuette from "../../assets/bf-silohuette.svg?react";

import '../../assets/sighting-marker.css';

export default function MarkerLegend() {
  const GREEN = "#00ff73";
  const GRAY = "#3a3a3a";

  const Item = ({ icon, label, desc }) => (
    <div style={{ display: "flex", gap: 10, padding: "8px 0" }}>
      <div style={{ width: 28, display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{desc}</div>
      </div>
    </div>
  );

  const chip = (color, text) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
        marginRight: 8,
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
          boxShadow: "0 0 0 2px rgba(0,0,0,0.25)",
        }}
      />
      {text}
    </span>
  );

  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Marker Legend</div>

      <div style={{ marginBottom: 12 }}>
        {chip(GREEN, "Modern / newly submitted")}
        {chip(GRAY, "Legacy / historical")}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 10 }}>
        <Item
          icon={<IoVideocamSharp size="1.5em" color={GREEN} />}
          label="Video Evidence"
          desc="Recorded video footage associated with the report."
        />
        <Item
          icon={<IoVolumeHigh size="1.5em" color={GREEN} />}
          label="Audio Encounter"
          desc="Audio encounter such as vocalizations, knocks, or ambient sounds."
        />
        <Item
          icon={<IoCamera size="1.5em" color={GREEN} />}
          label="Photographic Evidence"
          desc="Photographs tied directly to the encounter or location."
        />
        <Item
          icon={<IoEye size="1.5em" color={GREEN} />}
          label="Visual Sighting"
          desc="Eyewitness visual observation"
        />
        <Item
          icon={<GiFootprint size="1.5em" color={GREEN} />}
          label="Footprint / Physical Trace"
          desc="Tracks, footprints, scat or other evidence observed"
        />
        <Item
          icon={<BFSilohuette
          className="bf-icon"
            style={{
                color: GREEN,
                userSelect: "none",
                pointerEvents: "none",
            }}
          />}
          label="Unknown"
          desc="Used when no type is set or legacy entries lack classification."
        />
      </div>
    </div>
  );
}