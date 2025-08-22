import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

const GlobalAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = studentData._id;

  useEffect(() => {
    if (studentId) {
      fetchGlobalAssignments();
    }
  }, [studentId]);

  const fetchGlobalAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/teacher-classes/assignments', {
        params: { studentId }
      });
      
      console.log('Global assignments response:', response.data);
      setAssignments(response.data.files || []);
    } catch (error) {
      console.error('Error fetching global assignments:', error);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (assignment) => {
    try {
      console.log('Downloading assignment:', assignment.fileName);
      
      const response = await axios.get(`/api/teacher-classes/assignments/${assignment._id}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = assignment.originalName || assignment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Assignment download completed successfully');
    } catch (error) {
      console.error('Assignment download failed:', error);
      setError('Failed to download assignment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewAssignment = (assignment) => {
    alert(`Assignment Details:\n\nTitle: ${assignment.title || assignment.fileName}\nDescription: ${assignment.description}\nDue Date: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}\nClass: ${assignment.className || 'Unknown'} - ${assignment.subjectName || 'Unknown'}`);
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        Assignments
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and submit your assignments from all classes
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search assignments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredAssignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No assignments found' : 'No Assignments Available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms.' : 'No assignments have been uploaded by your teachers yet.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAssignments.map((assignment, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {assignment.fileName}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {assignment.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`${assignment.className || 'Unknown'} - ${assignment.subjectName || 'Unknown'}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={assignment.status || 'Available'} 
                      color={assignment.status === 'Submitted' ? 'success' : 'warning'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(assignment)}
                      fullWidth
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewAssignment(assignment)}
                      fullWidth
                    >
                      View
                    </Button>
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

export default GlobalAssignments; 