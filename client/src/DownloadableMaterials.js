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

export default function DownloadableMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchMaterials();
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/downloadables`);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMessage('Error fetching materials');
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

  const handleDelete = async (materialId) => {
    try {
      await axios.delete(`${API_URL}/downloadables/${materialId}`);
      fetchMaterials();
      setMessage('Material deleted successfully!');
      setSeverity('success');
    } catch (error) {
      console.error('Error deleting material:', error);
      setMessage('Error deleting material');
      setSeverity('error');
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/downloadables/${materialId}/download`, {
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

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = !filterTeacher || material.teacherName === filterTeacher;
    const matchesClass = !filterClass || material.className === filterClass;
    
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
        Downloadable Materials
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search materials..."
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
          onClick={fetchMaterials}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Materials Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Upload</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Upload By</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material._id}>
                <TableCell>
                  {new Date(material.dateUpload).toLocaleDateString()}
                </TableCell>
                <TableCell>{material.fileName}</TableCell>
                <TableCell>{material.description}</TableCell>
                <TableCell>{getTeacherName(material.teacherId)}</TableCell>
                <TableCell>{material.className || getClassName(material.classId)}</TableCell>
                <TableCell>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => handleDownload(material._id, material.fileName)}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(material._id)}
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

      {filteredMaterials.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No downloadable materials found
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