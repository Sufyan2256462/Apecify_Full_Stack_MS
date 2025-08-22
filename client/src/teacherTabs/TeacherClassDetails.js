import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  People as PeopleIcon,
  Subject as SubjectIcon,
  CloudDownload as DownloadIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  CalendarToday as CalendarIcon,
  Quiz as QuizIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import MyStudents from './MyStudents';
import SubjectOverview from './SubjectOverview';
import DownloadableMaterials from './DownloadableMaterials';
import Assignments from './Assignments';
import Announcements from './Announcements';
import ClassCalendar from './ClassCalendar';
import Quiz from './Quiz';
import AddDownloadables from './AddDownloadables';
import AddAnnouncement from './AddAnnouncement';
import AddAssignment from './AddAssignment';
import SharedFiles from './SharedFiles';

const TeacherClassDetails = ({ open, onClose, teacherClass }) => {
  const [selectedTab, setSelectedTab] = useState('my-students');

  const tabs = [
    { id: 'my-students', label: 'My Students', icon: <PeopleIcon />, component: MyStudents },
    { id: 'subject-overview', label: 'Subject Overview', icon: <SubjectIcon />, component: SubjectOverview },
    { id: 'downloadable-materials', label: 'Downloadable Materials', icon: <DownloadIcon />, component: DownloadableMaterials },
    { id: 'assignments', label: 'Assignments', icon: <AssignmentIcon />, component: Assignments },
    { id: 'announcements', label: 'Announcements', icon: <AnnouncementIcon />, component: Announcements },
    { id: 'class-calendar', label: 'Class Calendar', icon: <CalendarIcon />, component: ClassCalendar },
    { id: 'quiz', label: 'Quiz', icon: <QuizIcon />, component: Quiz },
    { id: 'add-downloadables', label: 'Add Downloadables', icon: <DownloadIcon />, component: AddDownloadables },
    { id: 'add-announcement', label: 'Add Announcement', icon: <AnnouncementIcon />, component: AddAnnouncement },
    { id: 'add-assignment', label: 'Add Assignment', icon: <AssignmentIcon />, component: AddAssignment },
    { id: 'shared-files', label: 'Shared Files', icon: <FolderIcon />, component: SharedFiles }
  ];

  const selectedTabData = tabs.find(tab => tab.id === selectedTab);
  const SelectedComponent = selectedTabData?.component;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {teacherClass?.className} - {teacherClass?.subjectName}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              position: 'relative'
            },
          }}
        >
          <List sx={{ pt: 0 }}>
            {tabs.map((tab) => (
              <ListItem
                button
                key={tab.id}
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
                <ListItemIcon sx={{ color: selectedTab === tab.id ? 'white' : 'inherit' }}>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText primary={tab.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {SelectedComponent && <SelectedComponent teacherClass={teacherClass} />}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherClassDetails; 