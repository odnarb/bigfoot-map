import React, { useState } from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import classNames from 'classnames';

import '../../assets/bfro-marker.css';

import { GiFootprint as BigfootIcon } from "react-icons/gi";
import { SightingDetails } from './SightingDetails';

export function BFMarker({ marker, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const renderBFPin = () => {
    return (
      <>
        <div className="custom-pin">
          <button className="close-button">
            <span className="material-symbols-outlined"> close </span>
          </button>

          <div className="image-container">
            <SightingDetails
              marker={marker}
              isExtended={isSelected}
            />
            <span className="icon">
              <BigfootIcon color="#b88b2e" size="2em" />
            </span>
          </div>
        </div>

        <div className="tip" />
      </>
    );
  };

  return (
    <>
      <AdvancedMarker
        key={marker.id}
        position={marker.position}
        title={marker.title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={classNames('bfro-marker', { clicked: isSelected, hovered })}
        onClick={onSelect}>
        {renderBFPin()}
      </AdvancedMarker>
    </>
  );
};