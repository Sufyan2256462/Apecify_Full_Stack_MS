import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Grid, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Tabs, Tab, Accordion, AccordionSummary, 
  AccordionDetails, LinearProgress, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

const MyProgress = ({ teacherClass }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = studentData._id;

  useEffect(() => {
    if (studentId) {
      fetchAttendanceData();
      fetchGradeData();
    }
  }, [studentId, teacherClass]);

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`/api/attendance/student/${studentId}/statistics`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
    }
  };

  const fetchGradeData = async () => {
    try {
      const response = await axios.get(`/api/grades/student/${studentId}/summary`);
      setGradeData(response.data);
    } catch (error) {
      console.error('Error fetching grade data:', error);
      setError('Failed to load grade data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon color="success" />;
      case 'absent':
        return <CancelIcon color="error" />;
      case 'late':
        return <ScheduleIcon color="warning" />;
      default:
        return <PersonIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateOverallGrade = () => {
    if (!gradeData?.summary || gradeData.summary.length === 0) return 'N/A';
    
    const totalMarks = gradeData.summary.reduce((sum, classData) => sum + classData.totalMarks, 0);
    const totalObtained = gradeData.summary.reduce((sum, classData) => sum + classData.totalObtained, 0);
    
    if (totalMarks === 0) return 'N/A';
    
    const overallPercentage = (totalObtained / totalMarks) * 100;
    
    if (overallPercentage >= 90) return 'A+';
    else if (overallPercentage >= 80) return 'A';
    else if (overallPercentage >= 70) return 'B+';
    else if (overallPercentage >= 60) return 'B';
    else if (overallPercentage >= 50) return 'C+';
    else if (overallPercentage >= 40) return 'C';
    else if (overallPercentage >= 30) return 'D';
    else return 'F';
  };

  const calculateOverallAttendance = () => {
    if (!attendanceData?.statistics || attendanceData.statistics.length === 0) return 0;
    
    const totalDays = attendanceData.statistics.reduce((sum, stat) => sum + stat.totalDays, 0);
    const totalPresent = attendanceData.statistics.reduce((sum, stat) => sum + stat.presentDays, 0);
    
    if (totalDays === 0) return 0;
    return Math.round((totalPresent / totalDays) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
      <Typography variant="h4" gutterBottom>My Progress</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your academic performance and attendance overview
      </Typography>

      {/* Overall Performance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Overall Grade</Typography>
              </Box>
              <Typography variant="h3" color="primary.main" sx={{ mb: 1 }}>
                {calculateOverallGrade()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {calculateOverallGrade() === 'A+' ? 'Excellent performance' : 
                 calculateOverallGrade() === 'A' ? 'Very good performance' :
                 calculateOverallGrade() === 'B+' ? 'Good performance' :
                 calculateOverallGrade() === 'B' ? 'Above average' :
                 calculateOverallGrade() === 'C+' ? 'Average performance' :
                 calculateOverallGrade() === 'C' ? 'Below average' :
                 calculateOverallGrade() === 'D' ? 'Needs improvement' :
                 calculateOverallGrade() === 'F' ? 'Failing' : 'No grades available'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Overall Attendance</Typography>
              </Box>
              <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>
                {calculateOverallAttendance()}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {calculateOverallAttendance() >= 90 ? 'Excellent attendance' :
                 calculateOverallAttendance() >= 80 ? 'Good attendance' :
                 calculateOverallAttendance() >= 70 ? 'Fair attendance' :
                 calculateOverallAttendance() >= 60 ? 'Below average attendance' :
                 'Poor attendance - needs improvement'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Attendance Details" />
          <Tab label="Grade Details" />
        </Tabs>
      </Paper>

      {/* Attendance Details Tab */}
      {selectedTab === 0 && (
        <Box>
          {attendanceData?.statistics && attendanceData.statistics.length > 0 ? (
            attendanceData.statistics.map((classStat, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{classStat.className} - {classStat.subjectName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {classStat.presentDays} present, {classStat.absentDays} absent, {classStat.lateDays} late
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${classStat.attendancePercentage}%`}
                      color={classStat.attendancePercentage >= 90 ? 'success' : 
                             classStat.attendancePercentage >= 80 ? 'primary' :
                             classStat.attendancePercentage >= 70 ? 'warning' : 'error'}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>Attendance Records</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Remarks</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {classStat.attendanceRecords.map((record, recordIndex) => (
                            <TableRow key={recordIndex}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={getStatusIcon(record.status)}
                                  label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  color={getStatusColor(record.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{record.remarks || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No Attendance Records</Typography>
              <Typography variant="body2" color="text.secondary">
                Your attendance records will appear here once teachers start marking attendance.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Grade Details Tab */}
      {selectedTab === 1 && (
        <Box>
          {gradeData?.summary && gradeData.summary.length > 0 ? (
            gradeData.summary.map((classData, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{classData.className} - {classData.subjectName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {classData.totalAssessments} assessments, Average: {classData.averageGrade}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${Math.round(classData.averagePercentage)}%`}
                      color={classData.averagePercentage >= 90 ? 'success' : 
                             classData.averagePercentage >= 80 ? 'primary' :
                             classData.averagePercentage >= 70 ? 'warning' : 'error'}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>Assessment Details</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Assessment</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Marks</TableCell>
                            <TableCell>Grade</TableCell>
                            <TableCell>Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {classData.assessments.map((assessment, assessmentIndex) => (
                            <TableRow key={assessmentIndex}>
                              <TableCell>{assessment.assessmentTitle}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={assessment.assessmentType.charAt(0).toUpperCase() + assessment.assessmentType.slice(1)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{assessment.obtainedMarks}/{assessment.maxMarks}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={assessment.grade}
                                  color={assessment.grade === 'A+' || assessment.grade === 'A' ? 'success' :
                                         assessment.grade === 'B+' || assessment.grade === 'B' ? 'primary' :
                                         assessment.grade === 'C+' || assessment.grade === 'C' ? 'warning' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{assessment.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No Grade Records</Typography>
              <Typography variant="body2" color="text.secondary">
                Your grades will appear here once teachers publish them.
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MyProgress; 