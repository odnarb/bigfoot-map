import React from 'react';

import '../../assets/sighting-details.css';
import { Typography } from '@mui/material';

export function SightingDetails ({ marker }) {
  return (
    <div className="details-container">
      <div className="listing-content">
        <h2>{marker.title}</h2>
        <p>Lat: {marker.position.lat}, Long: {marker.position.lng}</p>
        <div className="details">
          <div className="detail_item">
            <Typography>This is an item</Typography>
          </div>
          <div className="detail_item">
            <Typography>This is an item</Typography>
          </div>
          <div className="detail_item">
            <Typography>This is an item</Typography>
          </div>
        </div>

        <p className="description">{marker.info}</p>
      </div>
    </div>
  );
};