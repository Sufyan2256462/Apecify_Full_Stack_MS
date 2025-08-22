import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Grid, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, TextField,
  IconButton, Tooltip, Switch, FormControlLabel, Accordion, AccordionSummary,
  AccordionDetails, LinearProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

const AttendanceMarking = ({ teacherClass }) => {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    if (teacherClass?._id) {
      loadData();
    }
  }, [teacherClass, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    await Promise.all([
      fetchStudents(),
      fetchTodayAttendance()
    ]);
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/grades/teacher-class/${teacherClass._id}/students`);
      if (response.data && Array.isArray(response.data)) {
        setStudents(response.data);
        if (response.data.length === 0) {
          setError('No students found in this class');
        }
      } else {
        setError('Invalid student data received');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Failed to load students');
      setStudents([]);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance/teacher-class/${teacherClass._id}`, {
        params: { date: selectedDate }
      });
      
      const attendanceMap = {};
      response.data.attendance.forEach(record => {
        attendanceMap[record.studentId] = record.status;
      });
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkAttendance = (status) => {
    const newAttendanceData = {};
    students.forEach(student => {
      newAttendanceData[student._id] = status;
    });
    setAttendanceData(newAttendanceData);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        status: attendanceData[student._id] || 'absent',
        remarks: attendanceData[student._id] === 'absent' ? 'Not present in class' : 
                 attendanceData[student._id] === 'late' ? 'Arrived late' : 'Present and participated'
      }));

      await axios.post('/api/attendance/bulk', {
        teacherClassId: teacherClass._id,
        date: selectedDate,
        attendanceData: attendanceRecords,
        markedBy: 'teacher123' // This should come from logged-in teacher
      });

      setSuccess('Attendance marked successfully!');
      fetchTodayAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Failed to save attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get(`/api/attendance/teacher-class/${teacherClass._id}`);
      setAttendanceHistory(response.data.attendance);
      setShowHistoryDialog(true);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setError('Failed to load attendance history');
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

  const calculateAttendanceStats = () => {
    const totalStudents = students.length;
    const presentCount = Object.values(attendanceData).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceData).filter(status => status === 'late').length;
    const unmarkedCount = totalStudents - presentCount - absentCount - lateCount;

    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      unmarkedCount,
      attendancePercentage: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
    };
  };

  const stats = calculateAttendanceStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Student Attendance
        </Typography>
        <Tooltip title="Refresh student list">
          <IconButton onClick={loadData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={loadData} sx={{ ml: 2 }}>
            Try Again
          </Button>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Class Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Date Selection</Typography>
              </Box>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Attendance Summary</Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Chip label={`${stats.presentCount} Present`} color="success" size="small" />
                </Grid>
                <Grid item xs={3}>
                  <Chip label={`${stats.absentCount} Absent`} color="error" size="small" />
                </Grid>
                <Grid item xs={3}>
                  <Chip label={`${stats.lateCount} Late`} color="warning" size="small" />
                </Grid>
                <Grid item xs={3}>
                  <Chip label={`${stats.unmarkedCount} Unmarked`} color="default" size="small" />
                </Grid>
              </Grid>
              <LinearProgress 
                variant="determinate" 
                value={stats.attendancePercentage} 
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {stats.attendancePercentage}% attendance rate
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={bulkMode}
                  onChange={(e) => setBulkMode(e.target.checked)}
                />
              }
              label="Bulk Mode"
            />
          </Box>
          {bulkMode && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleBulkAttendance('present')}
              >
                Mark All Present
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleBulkAttendance('absent')}
              >
                Mark All Absent
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<ScheduleIcon />}
                onClick={() => handleBulkAttendance('late')}
              >
                Mark All Late
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Student Attendance Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Student Attendance</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={fetchAttendanceHistory}
              >
                View History
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTodayAttendance}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Registration No</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="bold">
                          {student.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.regNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(attendanceData[student._id])}
                        label={attendanceData[student._id] ? 
                          attendanceData[student._id].charAt(0).toUpperCase() + 
                          attendanceData[student._id].slice(1) : 'Unmarked'}
                        color={getStatusColor(attendanceData[student._id])}
                        variant={attendanceData[student._id] ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Mark Present">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAttendanceChange(student._id, 'present')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Absent">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAttendanceChange(student._id, 'absent')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Late">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleAttendanceChange(student._id, 'late')}
                          >
                            <ScheduleIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </Box>

      {/* Attendance History Dialog */}
      <Dialog 
        open={showHistoryDialog} 
        onClose={() => setShowHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1 }} />
            Attendance History
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recent attendance records for {teacherClass?.className} - {teacherClass?.subjectName}
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Marked By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceHistory.slice(0, 20).map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{record.studentId}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(record.status)}
                        label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.markedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceMarking;