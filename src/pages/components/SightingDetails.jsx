import React from 'react';

import { Typography } from '@mui/material';

import DOMPurify from "dompurify";

export function SightingDetails({ marker }) {
  return (
    <div className="details-container">
      <div className="listing-content">
        <h2>{marker.title}</h2>
        <p>Lat: {marker.position.lat}, Long: {marker.position.lng}</p>

        <p
          className="description"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(marker.info)
          }}
        />
      </div>
    </div>
  );
};