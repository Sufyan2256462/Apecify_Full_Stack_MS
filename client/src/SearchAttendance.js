import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Snackbar, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CLASS_URL = `${BASE_URL}/api/classes`;
const SEARCH_URL = `${BASE_URL}/api/attendance/search`;
const TEACHER_CLASSES_URL = `${BASE_URL}/api/teacher-classes`;
const TEACHERS_URL = `${BASE_URL}/api/teachers`; // Add this line

export default function SearchAttendance() {
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [markedByFilter, setMarkedByFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState(''); // Add this line
  const [teachers, setTeachers] = useState([]); // Add this line
  const [records, setRecords] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedRemarks, setEditedRemarks] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const [regularClasses, teacherClasses] = await Promise.all([
          axios.get(CLASS_URL).catch(() => ({ data: [] })),
          axios.get(TEACHER_CLASSES_URL).catch(() => ({ data: [] }))
        ]);

        // Combine and deduplicate classes
        const allClasses = [
          ...regularClasses.data,
          ...teacherClasses.data.map(tc => ({
            _id: tc._id,
            name: tc.className
          }))
        ];

        // Remove duplicates based on class name
        const uniqueClasses = allClasses.filter((cls, index, self) =>
          index === self.findIndex(c => c.name === cls.name)
        );

        setClasses(uniqueClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setSnackbar({ open: true, message: 'Error fetching classes', severity: 'error' });
      }
    };

    const fetchTeachers = async () => { // Add this block
      try {
        const res = await axios.get(TEACHERS_URL);
        setTeachers(res.data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setSnackbar({ open: true, message: 'Error fetching teachers', severity: 'error' });
      }
    };

    fetchClasses();
    fetchTeachers(); // Call fetchTeachers
  }, []);

  const handleSearch = async () => {
    setUserMessage('');
    setLoading(true);
    const params = {};
    if (classFilter) params.class = classFilter;
    if (dateFilter) params.date = dateFilter;
    if (studentFilter) params.student = studentFilter;
    if (markedByFilter) params.markedBy = markedByFilter;
    if (teacherFilter) params.teacherId = teacherFilter; // Add this line
    
    try {
      const res = await axios.get(SEARCH_URL, { params });
      
      // Transform the response data to include teacher information
      const attendanceWithDetails = res.data.map(record => ({
        ...record,
        markedByType: record.markedBy.includes('admin') ? 'Admin' : 'Teacher',
        className: record.class || classFilter,
        studentName: record.studentId?.name || 'N/A',
      }));
      
      setRecords(attendanceWithDetails);
      
      if (!attendanceWithDetails.length) {
        setUserMessage('No attendance records found for the selected criteria.');
      }
    } catch (error) {
      setRecords([]);
      setUserMessage('Error searching attendance records');
      setSnackbar({ open: true, message: 'Error searching attendance records', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingRecordId(record._id);
    setEditedStatus(record.status);
    setEditedRemarks(record.remarks);
  };

  const handleSaveEdit = async (id) => {
    try {
      // Determine who is marking the attendance (e.g., from user context or a fixed value for admin panel)
      // For this context, assuming it's an admin making the edit.
      const markedBy = 'admin'; // Or dynamically get from user session/context

      await axios.put(`${BASE_URL}/api/attendance/${id}`, {
        status: editedStatus,
        remarks: editedRemarks,
        markedBy: markedBy,
      });
      setSnackbar({ open: true, message: 'Attendance updated successfully!', severity: 'success' });
      setEditingRecordId(null);
      // Refresh the data after saving
      handleSearch();
    } catch (error) {
      console.error('Error updating attendance:', error);
      setSnackbar({ open: true, message: 'Error updating attendance', severity: 'error' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Registration No', 'Class', 'Date', 'Status', 'Remarks'];
    const rows = records.map(r => [
      r.studentId?.name || 'N/A',
      r.studentId?.regNo || 'N/A',
      r.class || (r.teacherClassId ? r.teacherClassId.className : 'N/A'),
      new Date(r.date).toLocaleDateString(),
      r.status,
      r.remarks
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'attendance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Attendance Report</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={classFilter}
            label="Class"
            onChange={e => setClassFilter(e.target.value)}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls.name}>{cls.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Date"
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Student Name/Reg No"
          value={studentFilter}
          onChange={e => setStudentFilter(e.target.value)}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Marked By</InputLabel>
          <Select
            value={markedByFilter}
            label="Marked By"
            onChange={e => setMarkedByFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}> {/* Add this block */}
          <InputLabel>Teacher</InputLabel>
          <Select
            value={teacherFilter}
            label="Teacher"
            onChange={e => setTeacherFilter(e.target.value)}
          >
            <MenuItem value="">All Teachers</MenuItem>
            {teachers.map(teacher => (
              <MenuItem key={teacher._id} value={teacher._id}>{teacher.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button 
          variant="contained" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
        <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV} disabled={records.length === 0}>Export CSV</Button>
      </Box>

      {userMessage && (
        <Typography color="error" sx={{ mb: 2 }}>{userMessage}</Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Registration No</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Marked By</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{record.studentId?.name || 'N/A'}</TableCell>
                <TableCell>{record.studentId?.regNo || 'N/A'}</TableCell>
                <TableCell>{record.class || record.teacherClassId?.className || 'N/A'}</TableCell>
                <TableCell>{record.subject || 'N/A'}</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {editingRecordId === record._id ? (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      >
                        <MenuItem value="present">Present</MenuItem>
                        <MenuItem value="absent">Absent</MenuItem>
                        <MenuItem value="late">Late</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: record.status === 'present' ? '#e8f5e9' :
                               record.status === 'absent' ? '#ffebee' :
                               '#fff3e0',
                      color: record.status === 'present' ? '#2e7d32' :
                             record.status === 'absent' ? '#c62828' :
                             '#ef6c00'
                    }}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Box>
                  )}
                </TableCell>
                <TableCell>{record.markedByType}</TableCell>
                <TableCell>
                  {editingRecordId === record._id ? (
                    <TextField
                      value={editedRemarks}
                      onChange={(e) => setEditedRemarks(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    record.remarks
                  )}
                </TableCell>
                <TableCell>
                  {editingRecordId === record._id ? (
                    <Button onClick={() => handleSaveEdit(record._id)} variant="contained" size="small">Save</Button>
                  ) : (
                    <Button onClick={() => handleEditClick(record)} variant="outlined" size="small">Edit</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}