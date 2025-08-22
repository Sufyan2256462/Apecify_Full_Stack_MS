import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Institutes from './Institutes';
import Courses from './Courses';
import Classes from './Classes';
import AdminUsers from './AdminUsers';
import Departments from './Departments';
import Students from './Students';
import DeactivatedStudents from './DeactivatedStudents';
import StudentAttendance from './StudentAttendance';
import SearchAttendance from './SearchAttendance';
import StudentCard from './StudentCard';
import Fees from './Fees';
import FeeReport from './FeeReport';
import Teachers from './Teachers';
import Content from './Content';
import AddExpense from './AddExpense';
import SearchExpense from './SearchExpense';
import SchoolYear from './SchoolYear';
import CalendarOfEvents from './CalendarOfEvents';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherLogin from './TeacherLogin';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import StudentLogin from './StudentLogin';
import UserLogs from './UserLogs';
import ActivityLogs from './ActivityLogs';
import DownloadableMaterials from './DownloadableMaterials';
import UploadedAssignments from './UploadedAssignments';
import Dashboard from './Dashboard';

const drawerWidth = 240;

const sidebarTabs = [
  'Dashboard',
  'Institutes',
  'Course',
  'Class',
  'Admin Users',
  'Department',
  'Students',
  'Deactivated Students',
  'Free Courses',
  'Student Attendance',
  'Student Card',
  'Search Attendance',
  'Fees',
  'Fee Report',
  'Teachers',
  'Downloadable Materials',
  'Uploaded Assignments',
  'Content',
  'User Log',
  'Activity Log',
  'Add Expense',
  'Search Expense',
  'School Year',
  'Calendar of Events',
];

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('Dashboard');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Student Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {sidebarTabs.map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton selected={selectedTab === text} onClick={() => setSelectedTab(text)}>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/teacher" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/*" element={
          <Box sx={{ display: 'flex', bgcolor: '#f4f6fa', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: '#1976d2' }}>
              <Toolbar>
                {isMobile && (
                  <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography variant="h6" noWrap component="div">
                  Student Management System
                </Typography>
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
              aria-label="mailbox folders"
            >
              {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
              <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  display: { xs: 'block', sm: 'block' },
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    bgcolor: '#fff',
                    borderRight: '1px solid #e0e0e0',
                  },
                }}
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
              <Toolbar />
              {selectedTab === 'Dashboard' && <Dashboard />}
              {selectedTab === 'Institutes' && <Institutes />}
              {selectedTab === 'Course' && <Courses />}
              {selectedTab === 'Class' && <Classes />}
              {selectedTab === 'Admin Users' && <AdminUsers />}
              {selectedTab === 'Department' && <Departments />}
              {selectedTab === 'Students' && <Students />}
              {selectedTab === 'Deactivated Students' && <DeactivatedStudents />}
              {selectedTab === 'Student Attendance' && <StudentAttendance />}
              {selectedTab === 'Student Card' && <StudentCard />}
              {selectedTab === 'Fees' && <Fees />}
              {selectedTab === 'Fee Report' && <FeeReport />}
              {selectedTab === 'Content' && <Content />}
              {selectedTab === 'Search Attendance' && <SearchAttendance />}
              {selectedTab === 'Teachers' && <Teachers />}
              {selectedTab === 'Add Expense' && <AddExpense />}
              {selectedTab === 'Search Expense' && <SearchExpense />}
              {selectedTab === 'School Year' && <SchoolYear />}
              {selectedTab === 'Calendar of Events' && <CalendarOfEvents />}
              {selectedTab === 'User Log' && <UserLogs />}
              {selectedTab === 'Activity Log' && <ActivityLogs />}
              {selectedTab === 'Downloadable Materials' && <DownloadableMaterials />}
              {selectedTab === 'Uploaded Assignments' && <UploadedAssignments />}
            </Box>
          </Box>
        } />
      </Routes>
    </Router>
  );
}

export default App;
