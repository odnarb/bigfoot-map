import React from 'react';

import DOMPurify from "dompurify";

export function SightingDetails({ marker }) {
  const sanitizedHtml = React.useMemo(() => {
    return DOMPurify.sanitize(marker.info, {
      ADD_ATTR: ["target", "rel"],
      FORBID_TAGS: ["script"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      RETURN_DOM: false,
    });
  }, [marker.info]);

  // Post-process links to enforce target + rel
  const htmlWithBlankTargets = React.useMemo(() => {
    const div = document.createElement("div");
    div.innerHTML = sanitizedHtml;

    div.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    return div.innerHTML;
  }, [sanitizedHtml]);

  return (
    <div className="details-container">
      <div className="listing-content">
        <h2>{marker.title}</h2>
        <p>Lat: {marker.position.lat}, Long: {marker.position.lng}</p>

        <p
          className="description"
          dangerouslySetInnerHTML={{
            __html: htmlWithBlankTargets
          }}
        />
      </div>
    </div>
  );
};