import { useState, useCallback, useEffect } from "react";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '@mui/material';

export default function DateRangeFilter({ min, max, dateRange, onChangeCommitted }) {
  const [uiRange, setUiRange] = useState(dateRange);

  // Keep local state in sync when parent updates externally
  useEffect(() => {
    setUiRange(dateRange);
  }, [dateRange]);

  const MIN_DISTANCE = 1;

  const marks = [
    {
      value: min,
      label: '',
    },
    {
      value: max,
      label: '',
    },
  ];

  const handleChange = useCallback((e, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;

    let next;
    if (activeThumb === 0) {
      next = [Math.min(newValue[0], newValue[1] - MIN_DISTANCE), newValue[1]];
    } else {
      next = [newValue[0], Math.max(newValue[1], newValue[0] + MIN_DISTANCE)];
    }

    setUiRange(next);
  }, []);

  const handleCommitted = useCallback(
    (e, val) => {
      if (!Array.isArray(val)) return;
      onChangeCommitted?.(val);
    },
    [onChangeCommitted]
  );

  const jumpToMin = useCallback(() => {
    const next = [Math.min(min, uiRange[1] - MIN_DISTANCE), uiRange[1]];
    setUiRange(next);
    onChangeCommitted?.(next);
  }, [min, uiRange, onChangeCommitted]);

  const jumpToMax = useCallback(() => {
    const next = [uiRange[0], Math.max(max, uiRange[0] + MIN_DISTANCE)];
    setUiRange(next);
    onChangeCommitted?.(next);
  }, [max, uiRange, onChangeCommitted]);

  return (
    <Box sx={{ width: '70%', mx: 'auto', textAlign: 'center' }}>
      <Slider
        getAriaLabel={() => 'Date range'}
        marks={marks}
        min={min}
        max={max}
        value={dateRange}
        onChange={handleChange}
        onChangeCommitted={handleCommitted}
        valueLabelDisplay="auto"
        disableSwap
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="body2"
          onClick={jumpToMin}
          sx={{ cursor: 'pointer' }}
        >
          {min}
        </Typography>
        <Typography
          variant="body2"
          onClick={jumpToMax}
          sx={{ cursor: 'pointer' }}
        >
          {max}
        </Typography>
      </Box>
    </Box>
  );
}
