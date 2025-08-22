import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Snackbar, Alert
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CLASS_URL = `${BASE_URL}/api/classes`;
const ATTENDANCE_URL = `${BASE_URL}/api/attendance`;
const TEACHER_CLASSES_URL = `${BASE_URL}/api/teacher-classes`;
const TEACHERS_URL = `${BASE_URL}/api/teachers`;

export default function StudentAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [date, setDate] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userMessage, setUserMessage] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [markedByFilter, setMarkedByFilter] = useState('');

  useEffect(() => {
    // Fetch both regular classes and teacher classes
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

    const fetchTeachers = async () => {
      try {
        const res = await axios.get(TEACHERS_URL);
        setTeachers(res.data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setSnackbar({ open: true, message: 'Error fetching teachers', severity: 'error' });
      }
    };
    
    fetchClasses();
    fetchTeachers();
  }, []);

  const handleFilter = async () => {
    setUserMessage('');
    if (!date) return; // Date is always required for filtering

    try {
      const params = { date };
      if (selectedClass) {
        params.class = selectedClass;
      }
      if (selectedTeacher) {
        params.teacherId = selectedTeacher;
      }
      if (studentSearch.trim()) {
        params.student = studentSearch.trim();
      }
      if (markedByFilter) {
        params.markedBy = markedByFilter;
      }
      const res = await axios.get(`${ATTENDANCE_URL}/search`, {
        params
      });
      
      // Transform the response data to include teacher information and subject
      const attendanceWithDetails = res.data.map(record => {
        // Determine the marked by type and teacher name
        let markedByType = 'Admin';
        let teacherName = 'Admin';
        
        if (record.markedBy && !record.markedBy.includes('admin')) {
          // Find the teacher name from the teachers list
          const teacher = teachers.find(t => t._id === record.markedBy);
          if (teacher) {
            markedByType = 'Teacher';
            teacherName = teacher.name;
          } else {
            markedByType = 'Teacher';
            teacherName = record.markedBy; // Fallback to the markedBy value
          }
        }
        
        // Get subject from teacherClassId if available
        let subject = 'N/A';
        if (record.teacherClassId?.subjectName) {
          subject = record.teacherClassId.subjectName;
        } else if (record.class) {
          // For regular classes, we might need to fetch the subject from the class
          // For now, we'll show the class name as subject
          subject = record.class;
        }
        
        return {
          ...record,
          markedByType,
          teacherName,
          subject,
          className: record.class || record.teacherClassId?.className || selectedClass,
          studentName: record.studentId?.name || 'N/A'
        };
      });
      
      setAttendance(attendanceWithDetails);
      
      if (!attendanceWithDetails.length) {
        setUserMessage('No attendance records found for the selected criteria.');
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendance([]);
      setUserMessage('No attendance records found for the selected criteria.');
    }
  };

  const handleStatusChange = (idx, status) => {
    setAttendance(attendance.map((a, i) => i === idx ? { ...a, status } : a));
  };
  const handleDescriptionChange = (idx, value) => {
    setAttendance(attendance.map((a, i) => i === idx ? { ...a, remarks: value } : a));
  };
  const handlePresentAll = () => {
    setAttendance(attendance.map(a => ({ ...a, status: 'present' })));
  };
  const handleAbsentAll = () => {
    setAttendance(attendance.map(a => ({ ...a, status: 'absent' })));
  };
  const handleSave = async () => {
    try {
      for (const record of attendance) {
        await axios.put(`${ATTENDANCE_URL}/${record._id}`, {
          status: record.status,
          remarks: record.remarks || ''
        });
      }
      setSnackbar({ open: true, message: 'Attendance updated!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating attendance', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${ATTENDANCE_URL}/${id}`);
      setSnackbar({ open: true, message: 'Attendance record deleted!', severity: 'success' });
      handleFilter(); // Refresh the list after deletion
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting attendance record', severity: 'error' });
    }
  };

  const handleExportCSV = () => {
    if (attendance.length === 0) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
      return;
    }

    // Create CSV content
    const headers = ['Student Name', 'Registration No', 'Class', 'Subject', 'Date', 'Status', 'Teacher Name', 'Remarks'];
    const csvContent = [
      headers.join(','),
      ...attendance.map(record => [
        record.studentId?.name || 'N/A',
        record.studentId?.regNo || 'N/A',
        record.class || record.teacherClassId?.className || 'N/A',
        record.subject || 'N/A',
        new Date(record.date).toLocaleDateString(),
        record.status,
        record.teacherName || 'N/A',
        record.remarks || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: 'CSV exported successfully!', severity: 'success' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClass}
            label="Class"
            onChange={e => setSelectedClass(e.target.value)}
          >
            <MenuItem value="">--Select Class--</MenuItem>
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls.name}>{cls.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Teacher Name</InputLabel>
          <Select
            value={selectedTeacher}
            label="Teacher Name"
            onChange={e => setSelectedTeacher(e.target.value)}
          >
            <MenuItem value="">--Select Teacher--</MenuItem>
            {teachers.map(teacher => (
              <MenuItem key={teacher._id} value={teacher._id}>{teacher.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Student..."
          value={studentSearch}
          onChange={e => setStudentSearch(e.target.value)}
          placeholder="Student name or reg no"
          sx={{ minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Marked By</InputLabel>
          <Select
            value={markedByFilter}
            label="Marked By"
            onChange={e => setMarkedByFilter(e.target.value)}
          >
            <MenuItem value="">--Select--</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleFilter}>SEARCH</Button>
        <Button variant="outlined" onClick={handleExportCSV}>EXPORT CSV</Button>
      </Box>
      {userMessage && (
        <Typography color="error" sx={{ mb: 2 }}>{userMessage}</Typography>
      )}
      {attendance.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="success" onClick={handlePresentAll}>Present All</Button>
            <Button variant="contained" color="error" onClick={handleAbsentAll}>Absent All</Button>
          </Box>
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
                  <TableCell>Teacher Name</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record, idx) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.studentId?.name || 'N/A'}</TableCell>
                    <TableCell>{record.studentId?.regNo || 'N/A'}</TableCell>
                    <TableCell>{record.class || record.teacherClassId?.className || 'N/A'}</TableCell>
                    <TableCell>{record.subject || 'N/A'}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={record.status}
                        onChange={(e) => handleStatusChange(idx, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="present">Present</MenuItem>
                        <MenuItem value="absent">Absent</MenuItem>
                        <MenuItem value="late">Late</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{record.teacherName}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={record.remarks || ''}
                        onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSave()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(record._id)}
                        sx={{ ml: 1 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={handleSave}>Save Attendance</Button>
        </>
      )}
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