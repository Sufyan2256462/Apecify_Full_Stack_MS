import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import axios from 'axios';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = studentData._id;

  useEffect(() => {
    if (studentId) {
      fetchGrades();
      fetchSummary();
    }
  }, [studentId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/grades/student/${studentId}`);
      
      console.log('Grades response:', response.data);
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to load grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`/api/grades/student/${studentId}/summary`);
      setSummary(response.data.summary || []);
    } catch (error) {
      console.error('Error fetching grade summary:', error);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    if (percentage >= 60) return 'info';
    return 'error';
  };

  const getAssessmentTypeColor = (type) => {
    switch (type) {
      case 'assignment': return 'primary';
      case 'quiz': return 'secondary';
      case 'midterm': return 'warning';
      case 'final': return 'error';
      case 'total': return 'success';
      default: return 'default';
    }
  };

  const getAssessmentTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'quiz': return '📋';
      case 'midterm': return '📊';
      case 'final': return '📈';
      case 'total': return '🎯';
      default: return '📄';
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Grades
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View your academic performance across all classes
      </Typography>

      {/* Grade Summary Cards */}
      {summary.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summary.map((classSummary, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {classSummary.className}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {classSummary.subjectName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" color="primary">
                      {classSummary.averageGrade}
                    </Typography>
                    <Chip
                      label={`${classSummary.averagePercentage.toFixed(1)}%`}
                      color={getGradeColor(classSummary.averagePercentage)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {classSummary.totalAssessments} assessments
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={classSummary.averagePercentage}
                      color={getGradeColor(classSummary.averagePercentage)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {grades.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Grades Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your teachers haven't published any grades yet.
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="All Grades" />
            <Tab label="By Class" />
          </Tabs>

          {selectedTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell>Assessment</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Marks</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.flatMap(classGrades => 
                    Object.entries(classGrades.assessments).flatMap(([type, assessments]) =>
                      assessments.map((grade, index) => (
                        <TableRow key={grade._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {classGrades.className}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {classGrades.subjectName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {grade.assessmentTitle}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${getAssessmentTypeIcon(grade.assessmentType)} ${grade.assessmentType}`}
                              color={getAssessmentTypeColor(grade.assessmentType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {grade.obtainedMarks}/{grade.maxMarks}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={grade.percentage}
                                  color={getGradeColor(grade.percentage)}
                                />
                              </Box>
                              <Typography variant="body2">
                                {grade.percentage.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={grade.grade}
                              color={getGradeColor(grade.percentage)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(grade.gradedAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedTab === 1 && (
            <Box>
              {grades.map((classGrades, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {classGrades.className}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {classGrades.subjectName}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${Object.keys(classGrades.assessments).length} assessment types`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(classGrades.assessments).map(([type, assessments]) => (
                      <Box key={type} sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          {getAssessmentTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Assessment</TableCell>
                                <TableCell>Marks</TableCell>
                                <TableCell>Percentage</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {assessments.map((grade) => (
                                <TableRow key={grade._id}>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {grade.assessmentTitle}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {grade.obtainedMarks}/{grade.maxMarks}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                          variant="determinate"
                                          value={grade.percentage}
                                          color={getGradeColor(grade.percentage)}
                                        />
                                      </Box>
                                      <Typography variant="body2">
                                        {grade.percentage.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={grade.grade}
                                      color={getGradeColor(grade.percentage)}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {new Date(grade.gradedAt).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Grades; 