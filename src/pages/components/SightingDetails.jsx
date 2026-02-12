import React from 'react';
import DOMPurify from 'dompurify';
import { Chip, Stack, Typography } from '@mui/material';

/**
 * Renders report details inside marker popup.
 *
 * @param {{
 *  marker: Record<string, any>,
 *  showExtended?: boolean
 * }} props - Component props.
 * @returns {JSX.Element} Report details UI.
 */
export function SightingDetails({ marker, showExtended = false }) {
  const sanitizedHtml = React.useMemo(() => {
    if (!marker?.info) {
      return '';
    }

    return DOMPurify.sanitize(marker.info, {
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      RETURN_DOM: false,
    });
  }, [marker?.info]);

  return (
    <div className="details-container">
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {marker.title}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={marker.datasetKey?.toUpperCase() || 'DATA'} size="small" />
          <Chip label={marker.triage?.status || 'new'} size="small" color="primary" variant="outlined" />
          <Chip label={marker.triage?.tier || 'unreviewed'} size="small" variant="outlined" />
          <Chip label={`👍 ${marker.votes?.up || 0}`} size="small" variant="outlined" />
          <Chip label={`👎 ${marker.votes?.down || 0}`} size="small" variant="outlined" />
        </Stack>

        {marker.position && (
          <Typography variant="caption">
            Lat: {marker.position.lat}, Lng: {marker.position.lng}
          </Typography>
        )}
        {marker.isoDate && (
          <Typography variant="caption">
            Date: {marker.isoDate.slice(0, 10)}
          </Typography>
        )}
        {marker.followedUpBy && (
          <Typography variant="caption">
            Followed up by: {marker.followedUpBy}
          </Typography>
        )}
        {!!marker.summary && (
          <Typography variant="body2">
            {marker.summary}
          </Typography>
        )}
        {!marker.summary && !!sanitizedHtml && (
          <p
            className="description"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        )}

        {showExtended && marker.sourceUrl && (
          <a href={marker.sourceUrl} target="_blank" rel="noreferrer noopener">
            Source link
          </a>
        )}
      </Stack>
    </div>
  );
}
