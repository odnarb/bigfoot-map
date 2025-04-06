import React, { useState}  from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import classNames from 'classnames';

import '../../assets/bfro-marker.css';
import bfroIcon from '../../assets/bfro-icon.jpg';


import { GiFootprint as BigfootPrint } from "react-icons/gi";

export function BFROMarker ({ marker }) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <AdvancedMarker
        key={marker.id}
        position={marker.position}
        title={marker.title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={classNames('bfro-marker', {clicked, hovered})}
        onClick={() => setClicked(!clicked)}>
              <BigfootPrint size="3em" />
            {/*
             <div className="custom-pin">
                <button className="close-button">
                    <span className="material-symbols-outlined"> close </span>
                </button>

                <div className="image-container">
                    <span className="icon">
                        <img src="../../assets/bfro-icon.jpg" />
                    </span>
                </div>
                {marker.info}
            </div>

            <div className="tip" />

            <SightingDetails />
            */}
      </AdvancedMarker>
    </>
  );
};