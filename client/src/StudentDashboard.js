import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  FileDownload as FileDownloadIcon,
  Announcement as AnnouncementIcon,
  Quiz as QuizIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Backpack as BackpackIcon,
  AccountCircle,
  KeyboardArrowDown,
  Logout as LogoutIcon
} from '@mui/icons-material';
import MyClasses from './studentTabs/MyClasses';
import Messages from './studentTabs/Messages';
import Notifications from './studentTabs/Notifications';
import GlobalAssignments from './studentTabs/GlobalAssignments';
import GlobalDownloadables from './studentTabs/GlobalDownloadables';
import GlobalAnnouncements from './studentTabs/GlobalAnnouncements';
import GlobalCalendar from './studentTabs/GlobalCalendar';
import GlobalQuizzes from './studentTabs/GlobalQuizzes';
import Grades from './studentTabs/Grades';
import NotificationBadge from './components/NotificationBadge';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const StudentDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('my-classes');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    // Get student data from localStorage
    const data = localStorage.getItem('studentData');
    if (!data) {
      navigate('/student');
      return;
    }
    setStudentData(JSON.parse(data));
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    localStorage.removeItem('studentToken');
    navigate('/student');
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'view_all') {
      setSelectedTab('notifications');
    }
  };

  const studentTabs = [
    { id: 'my-classes', label: 'My Classes', icon: <SchoolIcon /> },
    { id: 'assignments', label: 'Assignments', icon: <AssignmentIcon /> },
    { id: 'downloadables', label: 'Downloadable Materials', icon: <FileDownloadIcon /> },
    { id: 'announcements', label: 'Announcements', icon: <AnnouncementIcon /> },
    { id: 'calendar', label: 'Class Calendar', icon: <EventIcon /> },
    { id: 'quizzes', label: 'Quizzes', icon: <QuizIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'grades', label: 'Grades', icon: <BookIcon /> },
    { id: 'profile', label: 'My Profile', icon: <PersonIcon /> }
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'my-classes':
        return <MyClasses />;
      case 'assignments':
        return <GlobalAssignments />;
      case 'downloadables':
        return <GlobalDownloadables />;
      case 'announcements':
        return <GlobalAnnouncements />;
      case 'calendar':
        return <GlobalCalendar />;
      case 'quizzes':
        return <GlobalQuizzes />;
      case 'messages':
        return <Messages />;
      case 'notifications':
        return <Notifications />;
      case 'grades':
        return <Grades />;
      case 'profile':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your student profile
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to Student Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a tab from the sidebar to get started
            </Typography>
          </Box>
        );
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main'
          }}
        >
          <PersonIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {studentData?.name || 'Student Name'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reg No: {studentData?.regNo || 'STU001'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Class: {studentData?.class || 'N/A'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {studentTabs.map((tab) => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={selectedTab === tab.id}
              onClick={() => setSelectedTab(tab.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedTab === tab.id ? 'white' : 'inherit',
                }}
              >
                {tab.icon}
              </ListItemIcon>
              <ListItemText primary={tab.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!studentData) {
    return null; // Will redirect to login
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#1976d2',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Online Learning Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationBadge
              userType="student"
              userId={studentData._id}
              onNotificationClick={handleNotificationClick}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
              <AccountCircle sx={{ mr: 1 }} />
              <Typography variant="body2">{studentData?.name || 'Student Name'}</Typography>
              <KeyboardArrowDown />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StudentDashboard; 