import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const API_URL = 'http://localhost:5000/api/teacher-classes';

export default function SharedFiles({ teacherData }) {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [form, setForm] = useState({
    file: null,
    fileName: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  // Get teacher ID from props or localStorage
  const getTeacherId = () => {
    // First try to get from props
    if (teacherData && teacherData._id) {
      return teacherData._id;
    }
    
    // Then try from localStorage
    const teacherDataFromStorage = localStorage.getItem('teacherData');
    if (teacherDataFromStorage) {
      try {
        const teacher = JSON.parse(teacherDataFromStorage);
        if (teacher && teacher._id) {
          return teacher._id;
        }
      } catch (error) {
        console.error('Error parsing teacher data:', error);
      }
    }
    
    return null;
  };

  const teacherId = getTeacherId();

  console.log('TeacherData prop:', teacherData);
  console.log('Final teacherId:', teacherId);

  useEffect(() => {
    if (teacherId) {
      fetchTeachers();
      fetchSharedFiles();
      fetchReceivedFiles();
    }
  }, [teacherId]);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      // Filter out the current teacher
      const otherTeachers = response.data.filter(teacher => teacher._id !== teacherId);
      setTeachers(otherTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchSharedFiles = async () => {
    if (!teacherId) {
      console.log('No teacher ID available, skipping fetchSharedFiles');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/shared-files?teacherId=${teacherId}&type=shared`);
      // Handle the response structure: {files: [], total: 0}
      const files = response.data.files || response.data || [];
      setSharedFiles(files);
    } catch (error) {
      console.error('Error fetching shared files:', error);
      setSharedFiles([]); // Set empty array on error
    }
  };

  const fetchReceivedFiles = async () => {
    if (!teacherId) {
      console.log('No teacher ID available, skipping fetchReceivedFiles');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/shared-files?teacherId=${teacherId}&type=received`);
      // Handle the response structure: {files: [], total: 0}
      const files = response.data.files || response.data || [];
      setReceivedFiles(files);
    } catch (error) {
      console.error('Error fetching received files:', error);
      setReceivedFiles([]); // Set empty array on error
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckAll = () => {
    if (checkAll) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(teacher => teacher._id));
    }
    setCheckAll(!checkAll);
  };

  const handleTeacherSelection = (teacherId) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
    } else {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      setMessage('Teacher ID not found. Please log in again.');
      setSeverity('error');
      return;
    }
    if (!form.file || selectedTeachers.length === 0) {
      setMessage('Please select a file and at least one teacher');
      setSeverity('error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', form.file);
    formData.append('fileName', form.fileName || form.file.name);
    formData.append('description', form.description);
    formData.append('selectedTeachers', selectedTeachers.join(','));
    formData.append('teacherId', teacherId);

    console.log('Sharing file with teachers:', selectedTeachers);
    console.log('Teacher ID:', teacherId);

    try {
      const response = await axios.post(`${API_URL}/shared-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload response:', response.data);
      
      setForm({ file: null, fileName: '', description: '' });
      setSelectedTeachers([]);
      setCheckAll(false);
      fetchSharedFiles();
      fetchReceivedFiles();
      setMessage('File shared successfully!');
      setSeverity('success');
    } catch (error) {
      console.error('Error sharing file:', error);
      setMessage('Error sharing file: ' + (error.response?.data?.message || error.message));
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`${API_URL}/shared-files/${fileId}`);
      fetchSharedFiles();
      fetchReceivedFiles();
      setMessage('File deleted successfully!');
      setSeverity('success');
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage('Error deleting file');
      setSeverity('error');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/shared-files/${fileId}/download`, {
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

  if (!teacherId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Shared Files
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Teacher ID not found. Please log in again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shared Files
      </Typography>

      {/* Share New File Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Share New File
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Choose File
              </Button>
            </label>
            {form.file && (
              <Typography variant="body2" color="text.secondary">
                Selected: {form.file.name}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="File Name"
            name="fileName"
            value={form.fileName}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Check The Teacher you want to share this file with
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={checkAll}
                onChange={handleCheckAll}
              />
            }
            label="Check All"
            sx={{ mb: 1 }}
          />

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>TEACHER NAME</TableCell>
                  <TableCell>DEPARTMENT NAME</TableCell>
                  <TableCell>Select</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.department}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={selectedTeachers.includes(teacher._id)}
                        onChange={() => handleTeacherSelection(teacher._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !form.file || selectedTeachers.length === 0}
            startIcon={<CloudUploadIcon />}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </Paper>

      {/* Shared Files List */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Files You've Shared
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Upload</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Shared With</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(sharedFiles || []).map((file) => (
                <TableRow key={file._id}>
                  <TableCell>
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>{file.description}</TableCell>
                  <TableCell>{file.sharedWithNames?.join(', ') || 'All Teachers'}</TableCell>
                  <TableCell>
                    <Tooltip title="Download">
                      <IconButton
                        onClick={() => handleDownload(file._id, file.fileName)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(file._id)}
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
      </Paper>

      {/* Received Files List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Files Shared With You
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Upload</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Shared By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(receivedFiles || []).map((file) => (
                <TableRow key={file._id}>
                  <TableCell>
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>{file.description}</TableCell>
                  <TableCell>{file.uploadedByName || 'Unknown Teacher'}</TableCell>
                  <TableCell>
                    <Tooltip title="Download">
                      <IconButton
                        onClick={() => handleDownload(file._id, file.fileName)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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