import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Book as BookIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  FileDownload as FileDownloadIcon,
  Announcement as AnnouncementIcon,
  Quiz as QuizIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StudentQuiz from './StudentQuiz';
import MyProgress from './MyProgress';

const ClassDashboard = ({ teacherClassId, onBack }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');

  useEffect(() => {
    if (teacherClassId) {
      fetchClassData();
    }
  }, [teacherClassId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch class details
      const response = await axios.get(`/api/student-classes/class-details/${teacherClassId}`);
      console.log('Student class data fetched:', response.data);
      console.log('Materials count:', response.data.materials?.length);
      console.log('Events count:', response.data.events?.length);
      console.log('Events data:', response.data.events);
      setClassData(response.data);
    } catch (error) {
      console.error('Error fetching class data:', error);
      setError('Failed to load class data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDownload = async (material) => {
    try {
      console.log('Downloading:', material.fileName);
      
      const response = await axios.get(`/api/teacher-classes/downloadables/${material._id}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the file
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = material.originalName || material.fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownloadAssignment = async (assignment) => {
    try {
      console.log('Downloading assignment:', assignment.fileName);
      
      const response = await axios.get(`/api/student-classes/assignments/${assignment._id}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the file
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = assignment.originalName || assignment.fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
      console.log('Assignment download completed successfully');
    } catch (error) {
      console.error('Assignment download failed:', error);
      setError('Failed to download assignment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewAssignment = (assignment) => {
    // For now, just show an alert with assignment details
    // In a real application, you might want to open a modal or navigate to a detailed view
    alert(`Assignment Details:\n\nTitle: ${assignment.title || assignment.fileName}\nDescription: ${assignment.description}\nDue Date: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}`);
  };

  const handleDownloadSubjectOverview = async () => {
    try {
      if (!classData?.subjectOverview?.content) {
        alert('No subject overview content available to download.');
        return;
      }

      // Create a simple HTML document with the content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Subject Overview - ${classData.className}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1, h2, h3 { color: #1976d2; }
            .header { border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 30px; }
            .content { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Subject Overview</h1>
            <h2>${classData.className} - ${classData.subjectName}</h2>
            <p><strong>Teacher:</strong> ${classData.teacherName}</p>
            <p><strong>Last Updated:</strong> ${new Date(classData.subjectOverview.updatedAt).toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${classData.subjectOverview.content}
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Subject_Overview_${classData.className}_${classData.subjectName}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading subject overview:', error);
      alert('Failed to download subject overview.');
    }
  };

  const handleDownloadEventFile = async (event) => {
    try {
      if (!event.fileUrl) {
        alert('No file available for download.');
        return;
      }

      const response = await axios.get(`/api/teacher-classes/events/${event._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', event.fileName || 'event-file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading event file:', error);
      alert('Failed to download event file.');
    }
  };

  const tabs = [
    { label: 'My Classmates', icon: <PeopleIcon /> },
    { label: 'My Progress', icon: <BarChartIcon /> },
    { label: 'Subject Overview', icon: <DescriptionIcon /> },
    { label: 'Downloadable Materials', icon: <FileDownloadIcon /> },
    { label: 'Assignments', icon: <AssignmentIcon /> },
    { label: 'Announcements', icon: <AnnouncementIcon /> },
    { label: 'Class Calendar', icon: <CalendarIcon /> },
    { label: 'Quiz', icon: <QuizIcon /> }
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: // My Classmates
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              My Classmates
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Students enrolled in this class
            </Typography>
            
            {classData?.classmates?.length > 0 ? (
              <List>
                {classData.classmates.map((classmate, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={classmate.name}
                      secondary={`Reg No: ${classmate.regNo}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Classmates Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You are the only student in this class.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 1: // My Progress
        return <MyProgress />;

      case 2: // Subject Overview
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Subject Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Course content and learning objectives
            </Typography>
            
            {classData?.subjectOverview ? (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Course Overview
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleDownloadSubjectOverview()}
                    >
                      Download PDF
                    </Button>
                  </Box>
                  
                  <Box 
                    dangerouslySetInnerHTML={{ __html: classData.subjectOverview.content }} 
                    sx={{ 
                      '& h1, & h2, & h3, & h4, & h5, & h6': { 
                        color: 'text.primary',
                        fontWeight: 'bold',
                        mb: 1 
                      },
                      '& p': { 
                        mb: 2,
                        lineHeight: 1.6 
                      },
                      '& ul, & ol': { 
                        mb: 2,
                        pl: 2 
                      },
                      '& li': { 
                        mb: 0.5 
                      }
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Last updated: {new Date(classData.subjectOverview.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Subject Overview Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The teacher hasn't added a subject overview for this class yet.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 3: // Downloadable Materials
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Downloadable Materials
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Study materials and resources for this class
            </Typography>
            
                         <Grid container spacing={2}>
               {classData?.materials && classData.materials.length > 0 ? (
                 classData.materials.map((material, index) => (
                   <Grid item xs={12} sm={6} md={4} key={index}>
                     <Card>
                       <CardContent>
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                           <FileDownloadIcon sx={{ mr: 1, color: 'primary.main' }} />
                           <Typography variant="h6">
                             {material.title || material.fileName}
                           </Typography>
                         </Box>
                         <Typography variant="body2" color="text.secondary" paragraph>
                           {material.description}
                         </Typography>
                         <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                           Uploaded: {new Date(material.uploadedAt || material.dateUpload).toLocaleDateString()}
                         </Typography>
                         <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                           Class: {material.className || 'Unknown'} - {material.subjectName || 'Unknown'}
                         </Typography>
                         <Button 
                           variant="outlined" 
                           size="small"
                           onClick={() => handleDownload(material)}
                           startIcon={<FileDownloadIcon />}
                         >
                           Download
                         </Button>
                       </CardContent>
                     </Card>
                   </Grid>
                 ))
               ) : (
                 <Grid item xs={12}>
                   <Paper sx={{ p: 4, textAlign: 'center' }}>
                     <FileDownloadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                     <Typography variant="h6" color="text.secondary" gutterBottom>
                       No Materials Available
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       No downloadable materials have been uploaded for this class yet.
                     </Typography>
                   </Paper>
                 </Grid>
               )}
             </Grid>
          </Box>
        );

      case 4: // Assignments
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Assignments
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your assignments and submissions
            </Typography>
            
            <Grid container spacing={2}>
              {classData?.assignments?.map((assignment, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {assignment.title || assignment.fileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label={assignment.status || 'Available'} 
                          color={assignment.status === 'Submitted' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadAssignment(assignment)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 5: // Announcements
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Announcements
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Important updates from your teacher
            </Typography>
            
            <List>
              {classData?.announcements?.map((announcement, index) => (
                <ListItem key={index} sx={{ border: '1px solid #e0e0e0', mb: 2, borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <AnnouncementIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={announcement.title}
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          paragraph
                          dangerouslySetInnerHTML={{ __html: announcement.content }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Posted: {announcement.postedAt}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 6: // Class Calendar
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Class Calendar
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Important dates and events
            </Typography>
            
            <Grid container spacing={2}>
              {classData?.events && classData.events.length > 0 ? (
                classData.events.map((event, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">
                              {event.title}
                            </Typography>
                          </Box>
                          {event.eventType && (
                            <Chip 
                              label={event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                              size="small"
                              color={
                                event.eventType === 'exam' ? 'error' :
                                event.eventType === 'assignment' ? 'secondary' :
                                event.eventType === 'timetable' ? 'success' :
                                event.eventType === 'datesheet' ? 'warning' :
                                'primary'
                              }
                            />
                          )}
                        </Box>
                        
                        {event.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {event.description}
                          </Typography>
                        )}
                        
                        {event.duration && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Duration: {event.duration} minutes
                          </Typography>
                        )}
                        
                        {event.totalMarks && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Total Marks: {event.totalMarks}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {new Date(event.start).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>

                        {event.fileUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadEventFile(event)}
                            sx={{ mt: 1 }}
                          >
                            Download {event.fileName || 'File'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Events Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No calendar events have been added for this class yet.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 7: // Quiz
        return <StudentQuiz teacherClassId={teacherClassId} />;

      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to Class Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a tab from above to get started.
            </Typography>
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit" 
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {classData?.className} - {classData?.subjectName}
          </Typography>
        </Box>
        <Typography variant="body2">
          {studentData.name} ({studentData.regNo})
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default ClassDashboard; 