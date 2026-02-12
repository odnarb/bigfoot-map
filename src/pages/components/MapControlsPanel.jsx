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
 *  yearRange: [number, number],
 *  onYearRangeChange: (value: [number, number]) => void,
 *  timelineYear: number,
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
 * }} props - Component props.
 * @returns {JSX.Element} Controls panel.
 */
export default function MapControlsPanel({
  yearRange,
  onYearRangeChange,
  timelineYear,
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
}) {
  const activeDatasetCount = Object.values(datasetVisibility).filter(Boolean).length;
  const fullYearLabel = `${yearRange[0]} - ${yearRange[1]}`;

  return (
    <Paper className="map-controls-panel" elevation={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" className="map-controls-title">
        <Box>
          <Typography variant="h6">Research Controls</Typography>
          <Typography variant="body2" color="text.secondary">
            Filter reports by dataset, date, and map features.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} className="map-controls-status">
          <Chip size="small" label={`${activeDatasetCount} datasets on`} />
          <Chip size="small" variant="outlined" label={fullYearLabel} />
        </Stack>
      </Stack>
      <Divider />

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
        <Typography variant="subtitle2">Date Range</Typography>
        <Typography variant="caption" color="text.secondary">
          Limit which years are included in filtering and list results.
        </Typography>
        <Slider
          aria-label="Date Range"
          value={yearRange}
          onChange={(_event, nextValue) => {
            if (Array.isArray(nextValue)) {
              onYearRangeChange([nextValue[0], nextValue[1]]);
            }
          }}
          valueLabelDisplay="auto"
          min={1800}
          max={new Date().getFullYear()}
          disableSwap
        />
      </Box>

      <Box className="map-controls-block map-controls-card">
        <Typography variant="subtitle2">Timeline Scrub ({timelineYear})</Typography>
        <Typography variant="caption" color="text.secondary">
          Step through years to reveal report density changes over time.
        </Typography>
        <Slider
          aria-label={`Timeline Scrub (${timelineYear})`}
          value={timelineYear}
          onChange={(_event, nextValue) => onTimelineYearChange(Number(nextValue))}
          valueLabelDisplay="auto"
          min={yearRange[0]}
          max={yearRange[1]}
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
    </Paper>
  );
}
