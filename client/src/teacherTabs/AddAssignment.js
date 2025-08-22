import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

const AddAssignment = ({ teacherClass }) => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    if (teacherClass?.teacherId) {
      loadClasses();
      loadAssignments();
    }
  }, [teacherClass]);

  const loadClasses = async () => {
    if (!teacherClass?.teacherId) {
      console.log('No teacher ID available');
      return;
    }
    try {
      const response = await axios.get('/api/teacher-classes/classes', {
        params: { teacherId: teacherClass.teacherId }
      });
      setClasses(response.data);
      console.log('Classes loaded:', response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Failed to load classes');
    }
  };

  const loadAssignments = async () => {
    if (!teacherClass?.teacherId) {
      console.log('No teacher ID available');
      return;
    }
    try {
      const response = await axios.get('/api/teacher-classes/assignments', {
        params: { teacherId: teacherClass.teacherId }
      });
      const data = response.data.files || [];
      setAssignments(data);
      console.log('Assignments loaded:', data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleCheckAll = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classes.map(cls => cls.teacherClassId || cls._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || selectedClasses.length === 0) {
      setError('Please select a file and at least one class');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);
    formData.append('dueDate', dueDate);
    formData.append('selectedClasses', selectedClasses.join(','));

    try {
      console.log('Uploading assignment...');
      const response = await axios.post('/api/teacher-classes/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload response:', response.data);
      setMessage('Assignment uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      setDueDate('');
      setSelectedClasses([]);
      
      // Reload assignments
      setTimeout(() => {
        loadAssignments();
      }, 500);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    try {
      await axios.delete(`/api/teacher-classes/assignments/${assignmentId}`);
      setMessage('Assignment deleted successfully');
      loadAssignments();
    } catch (error) {
      setError('Failed to delete assignment');
    }
  };

  const handleDownload = async (assignment) => {
    try {
      const response = await axios.get(`/api/teacher-classes/assignments/${assignment._id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', assignment.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to download file');
    }
  };

  const handleView = (assignment) => {
    setViewItem(assignment);
    setViewDialog(true);
  };

  const getClassName = (teacherClassId) => {
    const cls = classes.find(c => (c.teacherClassId || c._id) === teacherClassId);
    return cls ? cls.className : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add Assignment
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload New Assignment
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="File"
                value={selectedFile ? selectedFile.name : 'No file selected'}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{ mb: 2 }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="*/*"
                />
              </Button>

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type="datetime-local"
                label="Due Date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, p: 1, bgcolor: 'primary.main', color: 'white' }}>
                Select Classes
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedClasses.length === classes.length}
                    onChange={handleCheckAll}
                  />
                }
                label="Check All"
                sx={{ mb: 2 }}
              />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>CLASS NAME</TableCell>
                      <TableCell>SUBJECT</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls._id}>
                        <TableCell>{cls.className}</TableCell>
                        <TableCell>{cls.subjectName}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={selectedClasses.includes(cls.teacherClassId || cls._id)}
                            onChange={() => handleClassSelection(cls.teacherClassId || cls._id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Upload Assignment'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Uploaded Assignments ({assignments.length})
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Upload</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No assignments uploaded yet
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>{new Date(assignment.dateUpload).toLocaleDateString()}</TableCell>
                    <TableCell>{assignment.fileName}</TableCell>
                    <TableCell>{assignment.description}</TableCell>
                    <TableCell>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</TableCell>
                    <TableCell>{getClassName(assignment.teacherClassId)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleView(assignment)} color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(assignment)} color="success">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(assignment._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assignment Details</DialogTitle>
        <DialogContent>
          {viewItem && (
            <Box>
              <Typography><strong>File Name:</strong> {viewItem.fileName}</Typography>
              <Typography><strong>Description:</strong> {viewItem.description}</Typography>
              <Typography><strong>Date Upload:</strong> {new Date(viewItem.dateUpload).toLocaleString()}</Typography>
              <Typography><strong>Due Date:</strong> {viewItem.dueDate ? new Date(viewItem.dueDate).toLocaleString() : 'No due date'}</Typography>
              <Typography><strong>Class:</strong> {getClassName(viewItem.teacherClassId)}</Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(viewItem)}
                sx={{ mt: 2 }}
              >
                Download File
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddAssignment; 