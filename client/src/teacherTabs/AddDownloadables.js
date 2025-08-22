import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { CloudUpload, Download, Delete } from '@mui/icons-material';
import axios from 'axios';

const AddDownloadables = ({ teacherClass }) => {
  const [classes, setClasses] = useState([]);
  const [downloadables, setDownloadables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    file: null,
    fileName: '',
    description: '',
    uploadDate: '',
    selectedClasses: []
  });

  // Fetch classes
  const fetchClasses = async () => {
    if (!teacherClass?.teacherId) {
      console.log('No teacher ID available');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher-classes/teacher/${teacherClass.teacherId}`);
      const teacherClasses = response.data;
      
      const formattedClasses = teacherClasses.map(tc => ({
        teacherClassId: tc._id,
        className: tc.className,
        subjectName: tc.subjectName,
        subjectCode: tc.subjectCode || 'N/A',
        teacherName: tc.teacherName,
        teacherId: tc.teacherId
      }));
      
      setClasses(formattedClasses);
      console.log('Classes loaded:', formattedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch downloadables
  const fetchDownloadables = async () => {
    if (!teacherClass?.teacherId) {
      console.log('No teacher ID available');
      return;
    }
    try {
      const response = await axios.get('/api/teacher-classes/downloadables', {
        params: { teacherId: teacherClass.teacherId }
      });
      console.log('Fetched downloadables response:', response.data);
      setDownloadables(response.data);
      console.log('Downloadables loaded:', response.data);
    } catch (error) {
      console.error('Error fetching downloadables:', error);
    }
  };

  useEffect(() => {
    if (teacherClass?.teacherId) {
      fetchClasses();
      fetchDownloadables();
    }
  }, [teacherClass]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
      console.log('File selected:', file);
    }
  };

  // Handle class selection
  const handleClassSelection = (classId) => {
    setFormData(prev => {
      const newSelectedClasses = prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId];
      
      console.log('Class selection updated:', newSelectedClasses);
      return { ...prev, selectedClasses: newSelectedClasses };
    });
  };

  // Handle "Check All" functionality
  const handleCheckAll = () => {
    if (formData.selectedClasses.length === classes.length) {
      // Uncheck all
      setFormData(prev => ({ ...prev, selectedClasses: [] }));
    } else {
      // Check all
      const allClassIds = classes.map(cls => cls.teacherClassId);
      setFormData(prev => ({ ...prev, selectedClasses: allClassIds }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== UPLOAD START ===');
    console.log('Form data:', formData);
    
    if (!formData.file) {
      setError('Please select a file');
      return;
    }
    
    if (formData.selectedClasses.length === 0) {
      setError('Please select at least one class');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');
    
    const formDataToSend = new FormData();
    formDataToSend.append('file', formData.file);
    formDataToSend.append('fileName', formData.fileName || formData.file.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('uploadDate', formData.uploadDate || new Date().toISOString());
    
    formData.selectedClasses.forEach(classId => {
      formDataToSend.append('selectedClasses', classId);
    });

    try {
      console.log('Sending upload request...');
      const response = await axios.post('/api/teacher-classes/downloadables', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload successful:', response.data);
      setMessage('Downloadable uploaded successfully!');
      
      // Reset form
      setFormData({
        file: null,
        fileName: '',
        description: '',
        uploadDate: '',
        selectedClasses: []
      });
      
      // Refresh downloadables list with a small delay to ensure backend has processed
      setTimeout(() => {
        fetchDownloadables();
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      console.log('=== UPLOAD END ===');
    }
  };

  // Handle file download
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

  // Handle file deletion
  const handleDelete = async (materialId) => {
    try {
      await axios.delete(`/api/teacher-classes/downloadables/${materialId}`);
      fetchDownloadables();
      setMessage('Downloadable deleted successfully!');
    } catch (error) {
      setError('Failed to delete downloadable');
    }
  };

  const isAllSelected = classes.length > 0 && formData.selectedClasses.length === classes.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add Downloadable Materials
      </Typography>

      {/* Upload Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload New Material
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* File Upload */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ height: 56 }}
              >
                {formData.file ? formData.file.name : 'Choose File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                />
              </Button>
            </Grid>

            {/* File Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="File Name"
                value={formData.fileName}
                onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                placeholder="Enter file name"
              />
            </Grid>

            {/* Upload Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Upload Date"
                value={formData.uploadDate}
                onChange={(e) => setFormData(prev => ({ ...prev, uploadDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </Grid>

            {/* Class Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Classes
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleCheckAll}
                    indeterminate={formData.selectedClasses.length > 0 && !isAllSelected}
                  />
                }
                label="Check All"
              />

              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Select</TableCell>
                      <TableCell>Class Name</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Subject Code</TableCell>
                      <TableCell>Teacher</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.teacherClassId}>
                        <TableCell>
                          <Checkbox
                            checked={formData.selectedClasses.includes(cls.teacherClassId)}
                            onChange={() => handleClassSelection(cls.teacherClassId)}
                          />
                        </TableCell>
                        <TableCell>{cls.className}</TableCell>
                        <TableCell>{cls.subjectName}</TableCell>
                        <TableCell>{cls.subjectCode}</TableCell>
                        <TableCell>{cls.teacherName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={uploading || !formData.file || formData.selectedClasses.length === 0}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload Downloadable'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>

      {/* Downloadables List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Uploaded Materials ({downloadables.length})
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {downloadables.map((material) => (
                <TableRow key={material._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {material.title || material.fileName}
                    </Typography>
                  </TableCell>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    {new Date(material.dateUpload || material.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={material.className || 'Unknown'} 
                      size="small" 
                      color="primary" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownload(material)}
                      sx={{ mr: 1 }}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(material._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {downloadables.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No downloadable materials uploaded yet.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AddDownloadables; 