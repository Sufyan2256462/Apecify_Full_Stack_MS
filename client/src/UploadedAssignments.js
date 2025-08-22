import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_URL = 'http://localhost:5000/api/admin';

export default function UploadedAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchAssignments();
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setMessage('Error fetching assignments');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleDelete = async (assignmentId) => {
    try {
      await axios.delete(`${API_URL}/assignments/${assignmentId}`);
      fetchAssignments();
      setMessage('Assignment deleted successfully!');
      setSeverity('success');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage('Error deleting assignment');
      setSeverity('error');
    }
  };

  const handleDownload = async (assignmentId, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/assignments/${assignmentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      setMessage('Error downloading file');
      setSeverity('error');
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = !filterTeacher || assignment.teacherName === filterTeacher;
    const matchesClass = !filterClass || assignment.className === filterClass;
    
    return matchesSearch && matchesTeacher && matchesClass;
  });

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  const getClassName = (classId) => {
    const classItem = classes.find(c => c._id === classId);
    return classItem ? classItem.name : 'Unknown Class';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Uploaded Assignments
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Teacher</InputLabel>
          <Select
            value={filterTeacher}
            label="Filter by Teacher"
            onChange={(e) => setFilterTeacher(e.target.value)}
          >
            <MenuItem value="">All Teachers</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher._id} value={teacher.name}>
                {teacher.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Class</InputLabel>
          <Select
            value={filterClass}
            label="Filter by Class"
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((classItem) => (
              <MenuItem key={classItem._id} value={classItem.name}>
                {classItem.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAssignments}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Assignments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date Upload</TableCell>
              <TableCell>Upload By</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.fileName}</TableCell>
                <TableCell>{assignment.description}</TableCell>
                <TableCell>
                  {new Date(assignment.dateUpload).toLocaleDateString()}
                </TableCell>
                <TableCell>{getTeacherName(assignment.teacherId)}</TableCell>
                <TableCell>{assignment.className || getClassName(assignment.classId)}</TableCell>
                <TableCell>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => handleDownload(assignment._id, assignment.fileName)}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(assignment._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAssignments.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No uploaded assignments found
          </Typography>
        </Box>
      )}

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
      >
        <Alert severity={severity} onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 