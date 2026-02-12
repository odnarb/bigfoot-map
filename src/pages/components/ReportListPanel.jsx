import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

/**
 * Report list split-view panel.
 *
 * @param {{
 *  reports: Array<Record<string, any>>,
 *  selectedReportId: string | null,
 *  onSelectReport: (report: Record<string, any>) => void
 * }} props - Component props.
 * @returns {JSX.Element} Report list panel.
 */
export default function ReportListPanel({ reports, selectedReportId, onSelectReport }) {
  return (
    <Paper elevation={3} className="report-list-panel">
      <Stack direction="row" justifyContent="space-between" alignItems="center" className="report-list-header">
        <Typography variant="h6">Reports</Typography>
        <Chip label={`${reports.length} visible`} size="small" aria-live="polite" />
      </Stack>
      <Divider />

      {reports.length === 0 ? (
        <Box className="report-list-empty-state">
          <Typography variant="body2" color="text.secondary">
            No reports match the current filters.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Expand the year range or re-enable one or more datasets.
          </Typography>
        </Box>
      ) : (
        <List dense className="report-list-scroll">
          {reports.map((report) => (
            <ListItemButton
              key={report.id}
              selected={selectedReportId === report.id}
              className="report-list-row"
              onClick={() => onSelectReport(report)}
            >
              <ListItemText
                primary={report.title}
                primaryTypographyProps={{ className: 'report-list-title' }}
                secondary={(
                  <span className="report-list-meta">
                    {report.datasetKey.toUpperCase()} • {report.isoDate ? report.isoDate.slice(0, 10) : 'Unknown date'}
                    <br />
                    {report.triage?.status || 'new'} • {report.triage?.tier || 'unreviewed'}
                  </span>
                )}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}
