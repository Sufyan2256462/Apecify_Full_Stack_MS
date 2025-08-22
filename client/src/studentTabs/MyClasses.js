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
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Book as BookIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ClassDashboard from './ClassDashboard';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();

  // Get student data from localStorage
  const getStudentData = () => {
    const studentData = localStorage.getItem('studentData');
    if (!studentData) {
      navigate('/student');
      return null;
    }
    return JSON.parse(studentData);
  };

  const studentData = getStudentData();
  const studentId = studentData?._id;

  useEffect(() => {
    if (studentId) {
      fetchStudentClasses();
    }
  }, [studentId]);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/student-classes/student-classes`, {
        params: { studentId }
      });
      
      console.log('Student classes response:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
  };

  const getEnrollmentStatus = (classItem) => {
    if (classItem.enrollmentType === 'enrolled') {
      return { label: 'Enrolled', color: 'success' };
    } else if (classItem.enrollmentType === 'matching') {
      return { label: 'Available', color: 'info' };
    }
    return { label: 'Unknown', color: 'default' };
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  if (!studentData) {
    return null; // Will redirect to login
  }

  // Show ClassDashboard if a class is selected
  if (selectedClass) {
    return (
      <ClassDashboard 
        teacherClassId={selectedClass.teacherClassId}
        onBack={handleBackToClasses}
      />
    );
  }

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Classes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Click on a class to view its detailed dashboard
      </Typography>

      {classes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Classes Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You haven't been added to any classes by teachers yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Classes will appear here when teachers add you to their classes or when classes match your registration data.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classItem, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleClassClick(classItem)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {classItem.className}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {classItem.subjectCode}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Subject
                    </Typography>
                    <Chip 
                      label={classItem.subjectName} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Teacher
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {classItem.teacherName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={getEnrollmentStatus(classItem).label}
                      color={getEnrollmentStatus(classItem).color}
                      size="small"
                    />
                  </Box>

                  {classItem.enrollmentDate && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Enrolled On
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(classItem.enrollmentDate)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                    <Chip 
                      label="Click to View Dashboard" 
                      color="primary" 
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyClasses; 