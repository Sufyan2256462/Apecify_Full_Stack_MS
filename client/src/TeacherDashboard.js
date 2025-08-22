import React, { useState, useEffect } from 'react';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, IconButton, Avatar, Badge, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Quiz as QuizIcon,
  Folder as FolderIcon,
  Class as ClassIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Description as DescriptionIcon,
  Book as BookIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import MyClass from './teacherTabs/MyClass';
import SubjectOverview from './teacherTabs/SubjectOverview';
import DownloadableMaterials from './teacherTabs/DownloadableMaterials';
import Assignments from './teacherTabs/Assignments';
import Announcements from './teacherTabs/Announcements';
import ClassCalendar from './teacherTabs/ClassCalendar';
import Quiz from './teacherTabs/Quiz';
import SharedFiles from './teacherTabs/SharedFiles';
import AddDownloadables from './teacherTabs/AddDownloadables';
import AddAnnouncement from './teacherTabs/AddAnnouncement';
import AddAssignment from './teacherTabs/AddAssignment';
import Messages from './teacherTabs/Messages';
import Notifications from './teacherTabs/Notifications';
import GradeManagement from './teacherTabs/GradeManagement';
import AttendanceMarking from './teacherTabs/AttendanceMarking';
import NotificationBadge from './components/NotificationBadge';
import axios from 'axios';
import Backpack from './teacherTabs/Backpack';

const drawerWidth = 240;
const teacherTabs = [
  { name: 'My Class', icon: <ClassIcon /> },
  { name: 'Subject Overview', icon: <DescriptionIcon /> },
  { name: 'Notification', icon: <NotificationsIcon /> },
  { name: 'Message', icon: <MessageIcon /> },
  { name: 'Backpack', icon: <SchoolIcon /> },
  { name: 'Add Downloadables', icon: <AddIcon /> },
  { name: 'Add Announcement', icon: <AddIcon /> },
  { name: 'Add Assignment', icon: <AddIcon /> },
  { name: 'Quiz', icon: <QuizIcon /> },
  { name: 'Shared Files', icon: <FolderIcon /> },
  { name: 'Grade Management', icon: <BookIcon /> },
  { name: 'Attendance Marking', icon: <CalendarIcon /> },
];

export default function TeacherDashboard() {
  const [selectedTab, setSelectedTab] = useState('My Class');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [teacherClass, setTeacherClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if teacher is logged in
    const teacherDataFromStorage = localStorage.getItem('teacherData');
    const teacherToken = localStorage.getItem('teacherToken');
    
    if (!teacherDataFromStorage || !teacherToken) {
      // Redirect to login if not authenticated
      window.location.href = '/teacher';
      return;
    }
    
    try {
      const teacher = JSON.parse(teacherDataFromStorage);
      setTeacherData(teacher);
      fetchTeacherClass(teacher._id);
    } catch (error) {
      console.error('Error parsing teacher data:', error);
      localStorage.removeItem('teacherData');
      localStorage.removeItem('teacherToken');
      window.location.href = '/teacher';
      return;
    }
    
    setLoading(false);
  }, []);

  const fetchTeacherClass = async (teacherId) => {
    try {
      console.log('Fetching teacher class for teacher ID:', teacherId);
      const response = await axios.get(`/api/teacher-classes/teacher/${teacherId}`);
      console.log('Teacher classes response:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Use the first teacher class found
        const firstClass = response.data[0];
        setTeacherClass({
          _id: firstClass._id,
          teacherId: firstClass.teacherId,
          className: firstClass.className,
          subjectName: firstClass.subjectName,
          schoolYear: firstClass.schoolYear || '2024-2025'
        });
        console.log('Set teacher class:', firstClass);
      } else {
        console.log('No teacher classes found for teacher ID:', teacherId);
      }
    } catch (error) {
      console.error('Error fetching teacher class:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherData');
    localStorage.removeItem('teacherToken');
    window.location.href = '/teacher';
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'view_all') {
      setSelectedTab('Notification');
    }
  };

  const drawer = (
    <div>
             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
         <Avatar sx={{ width: 80, height: 80, mb: 1, bgcolor: 'primary.main' }}>
           {teacherData ? teacherData.name.split(' ').map(n => n[0]).join('') : 'T'}
         </Avatar>
         <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
           {teacherData ? teacherData.name : 'Teacher'}
         </Typography>
         <Typography variant="caption" color="text.secondary">
           {teacherData ? teacherData.email : 'teacher@school.com'}
         </Typography>
         <Typography variant="caption" color="text.secondary">
           {teacherData ? teacherData.department : 'Department'}
         </Typography>
       </Box>
      <Divider sx={{ my: 2 }} />
      <List>
        {teacherTabs.map((tab) => (
          <ListItem key={tab.name} disablePadding>
            <ListItemButton 
              selected={selectedTab === tab.name} 
              onClick={() => setSelectedTab(tab.name)}
              sx={{ 
                mx: 1, 
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  '&:hover': {
                    bgcolor: '#e3f2fd',
                  }
                }
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {tab.badge ? (
                  <Badge badgeContent={tab.badge} color="error">
                    {tab.icon}
                  </Badge>
                ) : (
                  tab.icon
                )}
              </Box>
              <ListItemText primary={tab.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    if (!teacherClass) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Loading Teacher Class...</Typography>
        </Box>
      );
    }
    
    switch (selectedTab) {
      case 'My Class':
        return <MyClass teacherClass={teacherClass} />;
      case 'Add Downloadables':
        return <AddDownloadables teacherClass={teacherClass} />;
      case 'Add Announcement':
        return <AddAnnouncement teacherClass={teacherClass} />;
      case 'Add Assignment':
        return <AddAssignment teacherClass={teacherClass} />;
      case 'Quiz':
        return <Quiz teacherClass={teacherClass} />;
      case 'Shared Files':
        return <SharedFiles teacherClass={teacherClass} teacherData={teacherData} />;
      case 'Subject Overview':
        return <SubjectOverview teacherClass={teacherClass} />;
      case 'Notification':
        return <Notifications />;
      case 'Message':
        return <Messages />;
      case 'Grade Management':
        return <GradeManagement teacherClass={teacherClass} />;
      case 'Attendance Marking':
        return <AttendanceMarking teacherClass={teacherClass} />;
      case 'Backpack':
        return <Backpack teacherData={teacherData} />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{selectedTab}</Typography>
            <Box sx={{ minHeight: 400, background: '#fff', borderRadius: 2, boxShadow: 1, p: 2 }}>
              <Typography variant="body1" color="text.secondary">
                {selectedTab} content goes here.
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', background: '#f4f6fa', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#1976d2' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome to My Students In Class
          </Typography>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <NotificationBadge
               userType="teacher"
               userId={teacherData?._id}
               onNotificationClick={handleNotificationClick}
             />
             <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
               {teacherData ? teacherData.name.split(' ').map(n => n[0]).join('') : 'T'}
             </Avatar>
             <Typography variant="body2" sx={{ color: 'white' }}>
               {teacherData ? teacherData.name : 'Teacher'}
             </Typography>
             <IconButton
               color="inherit"
               onClick={handleUserMenuOpen}
               sx={{ p: 0 }}
             >
               <KeyboardArrowDownIcon />
             </IconButton>
           </Box>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
                 <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
         <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
         <Divider />
         <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#fff' },
          display: { xs: 'none', sm: 'block' },
        }}
        open
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#fff' },
        }}
      >
        {drawer}
      </Drawer>
             <Box component="main" sx={{ 
         flexGrow: 1, 
         mt: 8,
         position: 'relative',
         zIndex: 1,
         '& *': {
           backdropFilter: 'none !important',
           filter: 'none !important'
         }
       }}>
         {loading ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
             <Typography variant="h6" color="text.secondary">Loading...</Typography>
           </Box>
         ) : (
           renderContent()
         )}
       </Box>
    </Box>
  );
} 