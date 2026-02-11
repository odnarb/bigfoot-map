import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '@mui/material';

export default function DateRangeFilter({ min, max, dateRange, setDateRange }) {
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

    const handleChange = (e, newValue, activeThumb) => {
    if (activeThumb === 0) {
      setDateRange([Math.min(newValue[0], dateRange[1] - MIN_DISTANCE), dateRange[1]]);
    } else {
      setDateRange([dateRange[0], Math.max(newValue[1], dateRange[0] + MIN_DISTANCE)]);
    }
  };

  return (
    <Box sx={{ width: '70%', mx: 'auto', textAlign: 'center' }}>
      <Slider
        getAriaLabel={() => 'Date range'}
        marks={marks}
        min={min}
        max={max}
        value={dateRange}
        onChange={handleChange}
        valueLabelDisplay="auto"
        disableSwap
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="body2"
          onClick={() => setVal(MIN)}
          sx={{ cursor: 'pointer' }}
        >
          {min}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(MAX)}
          sx={{ cursor: 'pointer' }}
        >
          {max}
        </Typography>
      </Box>
    </Box>
  );
}
