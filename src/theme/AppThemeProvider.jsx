import { createContext, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { toggleColorMode } from '../store/slices/mapUiSlice';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
});

/**
 * Returns the current app theme mode context.
 *
 * @returns {{ mode: 'light' | 'dark', toggleMode: () => void }} Theme mode helpers.
 */
export function useAppThemeMode() {
  return useContext(ThemeModeContext);
}

/**
 * Builds a Material UI theme object from current color mode.
 *
 * @param {'light' | 'dark'} mode - App color mode.
 * @returns {import('@mui/material/styles').Theme} Material UI theme.
 */
function buildTheme(mode) {
  const isDarkMode = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDarkMode ? '#6fcf97' : '#236f53',
      },
      secondary: {
        main: isDarkMode ? '#f5c15a' : '#9f6f12',
      },
      background: {
        default: isDarkMode ? '#101315' : '#f5f7f4',
        paper: isDarkMode ? '#1a2023' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f1f5f2' : '#111b17',
        secondary: isDarkMode ? '#bdd1c8' : '#4e655c',
      },
    },
    typography: {
      fontFamily: '"Raleway", "Segoe UI", Tahoma, sans-serif',
      h6: {
        fontFamily: '"Rufina", serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"Rufina", serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"Rufina", serif',
        fontWeight: 700,
      },
    },
    shape: {
      borderRadius: 10,
    },
  });
}

/**
 * Wraps the app with MUI theme support and global mode toggle.
 *
 * @param {{ children: React.ReactNode }} props - Component props.
 * @returns {JSX.Element} Theme provider wrapper.
 */
export function AppThemeProvider({ children }) {
  const mode = useSelector((state) => state.mapUi.colorMode);
  const dispatch = useDispatch();

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const contextValue = useMemo(() => ({
    mode,
    toggleMode: () => dispatch(toggleColorMode()),
  }), [dispatch, mode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
