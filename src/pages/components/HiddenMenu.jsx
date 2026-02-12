import { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import {
  AppBar as MuiAppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  HelpCenter as HelpCenterIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Report as ReportIcon,
  VolunteerActivism as VolunteerActivismIcon,
} from '@mui/icons-material';
import { Link, Outlet } from 'react-router';
import { useAppThemeMode } from '../../theme/AppThemeProvider';
import MarkerLegend from './MarkerLegend';

const menuItems = [
  { text: 'Home', url: '/', icon: <HomeIcon /> },
  { text: 'Submit Report', url: '/submit-report', icon: <ReportIcon /> },
  { text: 'Donate', url: '/donate', icon: <VolunteerActivismIcon /> },
  { text: 'About', url: '/about', icon: <HelpCenterIcon /> },
];

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? 0 : `-${drawerWidth}px`,
    padding: 0,
  }),
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

/**
 * Root app shell with a collapsible navigation drawer.
 *
 * @returns {JSX.Element} App shell layout.
 */
export default function HiddenMenu() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { mode, toggleMode } = useAppThemeMode();
  const datasetVisibility = useSelector((state) => state.mapUi.datasetVisibility);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            sx={{ mr: 2, ...(open ? { display: 'none' } : {}) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">Mapping Sasquatch</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>Navigation</Typography>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              component={Link}
              key={item.text}
              disablePadding
              to={item.url}
              onClick={() => setOpen(false)}
            >
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">Theme</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">{mode === 'dark' ? 'Dark mode' : 'Light mode'}</Typography>
            <Switch checked={mode === 'dark'} onChange={toggleMode} />
          </Box>
        </Box>

        <Divider />
        <Box sx={{ px: 1, pb: 1, maxHeight: '70vh', overflowY: 'auto' }}>
          <MarkerLegend datasetVisibility={datasetVisibility} />
        </Box>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
}
