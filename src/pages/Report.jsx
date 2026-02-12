import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSubmitReportMutation } from '../store/services/reportApi';

const triageStatusDescriptions = {
  received: 'Received',
  needsInfo: 'Needs Minimum Info',
  queued: 'Queued for Review',
  inReview: 'In Review',
  vetted: 'Vetted',
};

/**
 * Returns true when the submission has enough data for public display.
 *
 * @param {Record<string, any>} formState - Submission form state.
 * @returns {boolean} Minimum information check result.
 */
function hasMinimumSubmissionInfo(formState) {
  return Boolean(
    formState.title.trim()
    && formState.summary.trim()
    && formState.isoDate
    && Number.isFinite(Number(formState.latitude))
    && Number.isFinite(Number(formState.longitude)),
  );
}

/**
 * Submission and triage page.
 *
 * @returns {JSX.Element} Report submission view.
 */
export default function Report() {
  const [submitReport, submitState] = useSubmitReportMutation();
  const [formState, setFormState] = useState({
    title: '',
    summary: '',
    isoDate: '',
    latitude: '',
    longitude: '',
    countyName: '',
    stateCode: '',
    countryCode: 'US',
    triageTier: 'unreviewed',
  });
  const [triageStatus, setTriageStatus] = useState('received');
  const [submitMessage, setSubmitMessage] = useState('');

  const minimumInfoComplete = useMemo(
    () => hasMinimumSubmissionInfo(formState),
    [formState],
  );

  const triageProgressLabel = triageStatusDescriptions[triageStatus] || 'Received';

  const handleFieldChange = (fieldName) => (event) => {
    setFormState((previousState) => ({
      ...previousState,
      [fieldName]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage('');

    try {
      if (!minimumInfoComplete) {
        setTriageStatus('needsInfo');
        setSubmitMessage('Please add title, summary, date, and map coordinates to continue.');
        return;
      }

      setTriageStatus('queued');
      const submissionPayload = {
        title: formState.title.trim(),
        summary: formState.summary.trim(),
        isoDate: formState.isoDate,
        position: {
          lat: Number(formState.latitude),
          lng: Number(formState.longitude),
        },
        countyName: formState.countyName || null,
        stateCode: formState.stateCode || null,
        countryCode: formState.countryCode,
        triage: {
          status: 'new',
          tier: formState.triageTier,
          minimumInfoComplete: true,
          followedUpBy: null,
          statusHistory: [],
        },
      };

      await submitReport({
        submission: submissionPayload,
        clientId: localStorage.getItem('mappingSasquatchClientId') || 'anonymous-client',
      }).unwrap();

      setTriageStatus('inReview');
      setSubmitMessage('Submission received. Your report has entered the triage queue.');
      setFormState({
        title: '',
        summary: '',
        isoDate: '',
        latitude: '',
        longitude: '',
        countyName: '',
        stateCode: '',
        countryCode: 'US',
        triageTier: 'unreviewed',
      });
    } catch (_error) {
      setTriageStatus('queued');
      setSubmitMessage('Could not submit to API right now. Please try again when backend is available.');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mt: 3, borderRadius: 2 }}>
        <Stack spacing={2} textAlign="left">
          <Typography variant="h4" component="h1">
            Submit an Encounter Report
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Minimum info required for public display: title, summary, date, and map coordinates.
          </Typography>

          <Alert severity={minimumInfoComplete ? 'success' : 'info'}>
            Triage status: <strong>{triageProgressLabel}</strong>
          </Alert>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Report Title"
                value={formState.title}
                onChange={handleFieldChange('title')}
                required
              />
              <TextField
                label="Report Summary"
                value={formState.summary}
                onChange={handleFieldChange('summary')}
                multiline
                minRows={4}
                required
              />
              <TextField
                label="Date"
                type="date"
                value={formState.isoDate}
                onChange={handleFieldChange('isoDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Latitude"
                  value={formState.latitude}
                  onChange={handleFieldChange('latitude')}
                  required
                />
                <TextField
                  label="Longitude"
                  value={formState.longitude}
                  onChange={handleFieldChange('longitude')}
                  required
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="County"
                  value={formState.countyName}
                  onChange={handleFieldChange('countyName')}
                />
                <TextField
                  label="State / Province"
                  value={formState.stateCode}
                  onChange={handleFieldChange('stateCode')}
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Country"
                  select
                  value={formState.countryCode}
                  onChange={handleFieldChange('countryCode')}
                >
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                </TextField>
                <TextField
                  label="Vetting Tier"
                  select
                  value={formState.triageTier}
                  onChange={handleFieldChange('triageTier')}
                >
                  <MenuItem value="unreviewed">Unreviewed</MenuItem>
                  <MenuItem value="screened">Screened</MenuItem>
                  <MenuItem value="high-confidence">High Confidence</MenuItem>
                </TextField>
              </Stack>

              <Button variant="contained" size="large" type="submit" disabled={submitState.isLoading}>
                {submitState.isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </Stack>
          </Box>

          {!!submitMessage && (
            <Alert severity={minimumInfoComplete ? 'success' : 'warning'}>
              {submitMessage}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
