import { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { DateTime } from "luxon";

import {
  Box, Toolbar,
  AppBar as MuiAppBar,
  List, CssBaseline, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemText, ListItemIcon,
  Drawer
} from '@mui/material';

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Report as ReportIcon,
  VolunteerActivism as VolunteerActivismIcon,
  Home as HomeIcon,
  HelpCenter as HelpCenterIcon
} from '@mui/icons-material';

import { Link, Outlet } from 'react-router';

import MarkerLegend from './MarkerLegend';

// TODO: Probably need to create a consts file for the frontend.
const menuItems = [
  { text: 'Home', url: '/', icon: <HomeIcon /> },
  { text: 'Submit Report', url: '/submit-report', icon: <ReportIcon /> },
  { text: 'Donate', url: '/donate', icon: <VolunteerActivismIcon /> },
  { text: 'About', url: '/about', icon: <HelpCenterIcon /> }
];

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? 0 : `-${drawerWidth}px`,
    padding: 0,
  })
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
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function HiddenMenu() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const MIN_DATE_YEAR = 1800;
  const MAX_DATE_YEAR = DateTime.now().year;
  const [dateRange, setDateRange] = useState([DateTime.now().year - 10, MAX_DATE_YEAR]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              { mr: 2 },
              open && { display: 'none' },
            ]}
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
            display: 'flex',
            flexDirection: 'column'
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />

        {/* Top nav links */}
        <List sx={{ flex: 0 }}>
          {menuItems.map((item, index) => (
            <ListItem
              component={Link}
              key={index}
              disablePadding
              sx={{ display: 'block' }}
              to={item.url}
              onClick={() => setOpen(false)}
            >
              <ListItemButton
                sx={[
                  { minHeight: 48, px: 2.5 },
                  open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                ]}
              >
                <ListItemIcon
                  sx={[
                    { minWidth: 0, justifyContent: 'center' },
                    open ? { mr: 3 } : { mr: 'auto' },
                  ]}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

      <Divider sx={{ my: 1 }} />

        {/* Marker Legend */}
        <Box
          sx={{
            px: 1,
            pb: 1,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <MarkerLegend />
        </Box>
      </Drawer>

      <Main open={open} sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DrawerHeader />

        {/* This Box becomes the "page body" area */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Outlet context={{ dateRange, setDateRange, MIN_DATE_YEAR, MAX_DATE_YEAR }} />
        </Box>
      </Main>
    </Box>
  );
}