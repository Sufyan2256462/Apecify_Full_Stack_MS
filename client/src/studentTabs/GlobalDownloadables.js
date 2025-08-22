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
  FileDownload as FileDownloadIcon,
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

const GlobalDownloadables = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = studentData._id;

  useEffect(() => {
    if (studentId) {
      fetchGlobalMaterials();
    }
  }, [studentId]);

  const fetchGlobalMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/teacher-classes/downloadables', {
        params: { studentId }
      });
      
      console.log('Global materials response:', response.data);
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error fetching global materials:', error);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      console.log('Downloading material:', material.fileName);
      
      const response = await axios.get(`/api/teacher-classes/downloadables/${material._id}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.originalName || material.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Material download completed successfully');
    } catch (error) {
      console.error('Material download failed:', error);
      setError('Failed to download material: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
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
        Downloadable Materials
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Access study materials and resources from all your classes
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search materials..."
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

      {filteredMaterials.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FileDownloadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No materials found' : 'No Materials Available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms.' : 'No downloadable materials have been uploaded by your teachers yet.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMaterials.map((material, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FileDownloadIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {material.title || material.fileName}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {material.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`${material.className || 'Unknown'} - ${material.subjectName || 'Unknown'}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Uploaded: {new Date(material.dateUpload || material.uploadedAt).toLocaleDateString()}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleDownload(material)}
                    startIcon={<DownloadIcon />}
                    fullWidth
                    sx={{ mt: 'auto' }}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GlobalDownloadables; 