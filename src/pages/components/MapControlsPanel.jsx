import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Slider,
  Switch,
  Typography,
} from '@mui/material';
import { MdOutlineDownload } from 'react-icons/md';

/**
 * Map controls component for filters and overlays.
 *
 * @param {{
 *  timelineYear: number,
 *  minYear: number,
 *  maxYear: number,
 *  onTimelineYearChange: (value: number) => void,
 *  datasetVisibility: Record<string, boolean>,
 *  onToggleDataset: (datasetKey: string, nextVisible: boolean) => void,
 *  showHeatmap: boolean,
 *  onToggleHeatmap: (nextValue: boolean) => void,
 *  showCountyOverlay: boolean,
 *  onToggleCountyOverlay: (nextValue: boolean) => void,
 *  splitViewEnabled: boolean,
 *  onToggleSplitView: (nextValue: boolean) => void,
 *  onExportCsv: () => void,
 *  onExportGeoJson: () => void,
 *  controlsCollapsed: boolean,
 *  onToggleControlsCollapsed: () => void,
 * }} props - Component props.
 * @returns {JSX.Element} Controls panel.
 */
export default function MapControlsPanel({
  timelineYear,
  minYear,
  maxYear,
  onTimelineYearChange,
  datasetVisibility,
  onToggleDataset,
  showHeatmap,
  onToggleHeatmap,
  showCountyOverlay,
  onToggleCountyOverlay,
  splitViewEnabled,
  onToggleSplitView,
  onExportCsv,
  onExportGeoJson,
  controlsCollapsed,
  onToggleControlsCollapsed,
}) {
  const activeDatasetCount = Object.values(datasetVisibility).filter(Boolean).length;
  const fullYearLabel = `${minYear} - ${maxYear}`;

  return (
    <Paper className={`map-controls-panel ${controlsCollapsed ? 'map-controls-panel-collapsed' : ''}`} elevation={4}>
      {controlsCollapsed ? (
        <Stack direction="row" spacing={1} alignItems="center" className="map-controls-collapsed">
          <Button
            size="small"
            variant="contained"
            onClick={onToggleControlsCollapsed}
            aria-label="Show map filters"
          >
            Show Filters
          </Button>
          <Chip size="small" variant="outlined" label={`${activeDatasetCount} datasets on`} />
        </Stack>
      ) : (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" className="map-controls-title">
            <Box>
              <Typography variant="h6">Research Controls</Typography>
              <Typography variant="body2" color="text.secondary">
                Filter reports by dataset and timeline.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} className="map-controls-actions">
              <Chip size="small" label={`${activeDatasetCount} datasets on`} />
              <Chip size="small" variant="outlined" label={fullYearLabel} />
              <Button
                size="small"
                variant="outlined"
                onClick={onToggleControlsCollapsed}
                aria-label="Hide map filters"
              >
                Hide Filters
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Box className="map-controls-content">
            <Box className="map-controls-block map-controls-card">
              <Typography variant="subtitle2">Dataset Layers</Typography>
              <Typography variant="caption" color="text.secondary">
                Toggle source datasets in the current view.
              </Typography>
              <FormGroup className="map-controls-switches">
                <FormControlLabel
                  control={<Switch checked={datasetVisibility.bfro} onChange={(event) => onToggleDataset('bfro', event.target.checked)} />}
                  label="BFRO"
                />
                <FormControlLabel
                  control={<Switch checked={datasetVisibility.woodape} onChange={(event) => onToggleDataset('woodape', event.target.checked)} />}
                  label="Woodape"
                />
                <FormControlLabel
                  control={<Switch checked={datasetVisibility.kilmury} onChange={(event) => onToggleDataset('kilmury', event.target.checked)} />}
                  label="Kilmury"
                />
              </FormGroup>
            </Box>

            <Box className="map-controls-block map-controls-card">
              <Typography variant="subtitle2">Timeline Scrub ({timelineYear})</Typography>
              <Typography variant="caption" color="text.secondary">
                Scrub through available sighting years.
              </Typography>
              <Slider
                aria-label={`Timeline Scrub (${timelineYear})`}
                value={timelineYear}
                onChange={(_event, nextValue) => onTimelineYearChange(Number(nextValue))}
                valueLabelDisplay="auto"
                min={minYear}
                max={maxYear}
              />
            </Box>

            <Box className="map-controls-block map-controls-card">
              <Typography variant="subtitle2">Feature Toggles</Typography>
              <Typography variant="caption" color="text.secondary">
                Enable additional overlays and layout tools.
              </Typography>
              <FormGroup className="map-controls-switches">
                <FormControlLabel
                  control={<Switch checked={showHeatmap} onChange={(event) => onToggleHeatmap(event.target.checked)} />}
                  label="Heatmap"
                />
                <FormControlLabel
                  control={<Switch checked={showCountyOverlay} onChange={(event) => onToggleCountyOverlay(event.target.checked)} />}
                  label="County Overlay"
                />
                <FormControlLabel
                  control={<Switch checked={splitViewEnabled} onChange={(event) => onToggleSplitView(event.target.checked)} />}
                  label="List + Map Split View"
                />
              </FormGroup>
            </Box>

            <Box className="map-controls-block map-controls-card export-buttons">
              <Typography variant="subtitle2">Export</Typography>
              <Typography variant="caption" color="text.secondary">
                Download the currently filtered reports.
              </Typography>
              <Button
                startIcon={<MdOutlineDownload />}
                variant="outlined"
                aria-label="Export filtered reports as CSV"
                onClick={onExportCsv}
              >
                CSV
              </Button>
              <Button
                startIcon={<MdOutlineDownload />}
                variant="outlined"
                aria-label="Export filtered reports as GeoJSON"
                onClick={onExportGeoJson}
              >
                GeoJSON
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
}
