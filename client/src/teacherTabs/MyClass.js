import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Avatar, Divider, Paper, Alert, CircularProgress,
  List, ListItem, ListItemAvatar, ListItemText, Avatar as MuiAvatar, Pagination
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon,
  Person as PersonIcon, School as SchoolIcon, Class as ClassIcon
} from '@mui/icons-material';
import axios from 'axios';
import TeacherClassDetails from './TeacherClassDetails';

export default function MyClass({ teacherClass }) {
  const [classes, setClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2024-2025');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    className: '',
    subjectId: '',
    subjectName: '',
    schoolYear: '2024-2025'
  });
  const [openStudentsModal, setOpenStudentsModal] = useState(false);
  const [selectedTeacherClass, setSelectedTeacherClass] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [adminStudents, setAdminStudents] = useState([]);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  // Get teacher data from props
  const teacherId = teacherClass?.teacherId || 'teacher123';
  const teacherName = teacherClass?.teacherName || 'Teacher';

  const schoolYears = [
    '2024-2025', '2025-2025', '2025-2026', '2026-2027', '2027-2028'
  ];

  // Fetch teacher classes
  const fetchTeacherClasses = async (schoolYear = null) => {
    try {
      setLoadingData(true);
      const params = schoolYear ? { schoolYear } : {};
      const response = await axios.get(`/api/teacher-classes/teacher/${teacherId}`, { params });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch available admin classes
  const fetchAvailableClasses = async () => {
    try {
      const response = await axios.get('/api/teacher-classes/available-classes');
      setAvailableClasses(response.data);
    } catch (error) {
      console.error('Error fetching available classes:', error);
    }
  };

  // Fetch available admin subjects (courses)
  const fetchAvailableSubjects = async () => {
    try {
      const response = await axios.get('/api/teacher-classes/available-subjects');
      setAvailableSubjects(response.data);
    } catch (error) {
      console.error('Error fetching available subjects:', error);
    }
  };

  // Fetch assigned students for a teacher class
  const fetchAssignedStudents = async (teacherClassId) => {
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClassId}/students`);
      setAssignedStudents(res.data);
    } catch (err) {
      setAssignedStudents([]);
    }
  };

  // Fetch admin students for a teacher class (with search)
  const fetchAdminStudents = async (teacherClassId, search = '') => {
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClassId}/admin-students`, { params: { search } });
      setAdminStudents(res.data);
    } catch (err) {
      setAdminStudents([]);
    }
  };

  // Open modal for a class
  const handleOpenStudentsModal = async (teacherClass) => {
    setSelectedTeacherClass(teacherClass);
    setOpenStudentsModal(true);
    await fetchAssignedStudents(teacherClass._id);
    await fetchAdminStudents(teacherClass._id);
  };

  // Add student to teacher class
  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddStudentLoading(true);
    try {
      await axios.post(`/api/teacher-classes/${selectedTeacherClass._id}/students`, { studentId: selectedStudentId });
      await fetchAssignedStudents(selectedTeacherClass._id);
      setSelectedStudentId('');
      // Refetch teacher classes to update student count
      fetchTeacherClasses();
    } catch (err) {
      // Optionally show error
    } finally {
      setAddStudentLoading(false);
    }
  };

  // Remove student from teacher class
  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/api/teacher-classes/${selectedTeacherClass._id}/students/${studentId}`);
      await fetchAssignedStudents(selectedTeacherClass._id);
      // Refetch teacher classes to update student count
      fetchTeacherClasses();
    } catch (err) {}
  };

  useEffect(() => {
    fetchTeacherClasses();
    fetchAvailableClasses();
    fetchAvailableSubjects();
  }, []);

  const handleAddClass = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Find the selected class and subject details
      const selectedClass = availableClasses.find(cls => cls._id === formData.className);
      const selectedSubject = availableSubjects.find(subj => subj._id === formData.subjectId);
      
      if (!selectedClass || !selectedSubject) {
        setError('Please select both class and subject');
        return;
      }

      const classData = {
        teacherId,
        teacherName,
        classId: selectedClass._id,
        className: selectedClass.name,
        subjectId: selectedSubject._id,
        subjectName: selectedSubject.name,
        schoolYear: formData.schoolYear
      };

      const response = await axios.post('/api/teacher-classes', classData);
      setClasses([response.data, ...classes]);
      
      setFormData({
        className: '',
        subjectId: '',
        subjectName: '',
        schoolYear: '2024-2025'
      });
      setOpenAddDialog(false);
      setSuccess('Class added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding class:', error);
      setError(error.response?.data?.message || 'Failed to add class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/teacher-classes/${classId}`);
      setClasses(classes.filter(cls => cls._id !== classId));
      setSuccess('Class removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting class:', error);
      setError('Failed to remove class');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTeacherClasses(selectedSchoolYear);
  };

  const handleClassChange = (classId) => {
    setFormData({ ...formData, className: classId });
  };

  const handleSubjectChange = (subjectId) => {
    const selectedSubject = availableSubjects.find(subj => subj._id === subjectId);
    setFormData({ 
      ...formData, 
      subjectId,
      subjectName: selectedSubject ? selectedSubject.name : ''
    });
  };

  const pagedClasses = classes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 120px)' }}>
      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            My Class / School Year: {selectedSchoolYear}
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Class Cards Grid */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : classes.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography variant="h6" color="text.secondary">
                No classes assigned yet. Add your first class!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {pagedClasses.map((cls) => (
                <Box key={cls._id} sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 350 }}>
                  <Card sx={{
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': { boxShadow: 3 },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenStudentsModal(cls)}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5'
                      }}
                    >
                      <ClassIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                    </CardMedia>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {cls.className}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {cls.subjectName}
                        </Typography>
                        <Chip 
                          label={`${cls.studentCount} students`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteClass(cls._id);
                          }}
                          disabled={loading}
                          sx={{ '&:hover': { bgcolor: '#ffebee' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(classes.length / PAGE_SIZE)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>

      {/* Add Class Panel */}
      <Paper sx={{ width: 300, p: 3, height: 'fit-content' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AddIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Add class
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Class Name</InputLabel>
            <Select
              value={formData.className}
              label="Class Name"
              onChange={(e) => handleClassChange(e.target.value)}
            >
              {availableClasses.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select
              value={formData.subjectId}
              label="Subject"
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {availableSubjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="School Year"
            variant="outlined"
            size="small"
            value={formData.schoolYear}
            onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
            fullWidth
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            disabled={!formData.className || !formData.subjectId}
            sx={{ 
              bgcolor: '#4caf50', 
              '&:hover': { bgcolor: '#45a049' },
              mt: 1
            }}
            fullWidth
          >
            Save
          </Button>
        </Box>

        {/* Search Past Class Section */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Search Past Class
        </Typography>
        
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel>School Year</InputLabel>
          <Select
            value={selectedSchoolYear}
            label="School Year"
            onChange={(e) => setSelectedSchoolYear(e.target.value)}
          >
            {schoolYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          sx={{ 
            bgcolor: '#1976d2', 
            '&:hover': { bgcolor: '#1565c0' }
          }}
          fullWidth
        >
          Search
        </Button>
      </Paper>

      {/* Add Class Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Class Name</InputLabel>
              <Select
                value={formData.className}
                label="Class Name"
                onChange={(e) => handleClassChange(e.target.value)}
              >
                {availableClasses.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={formData.subjectId}
                label="Subject"
                onChange={(e) => handleSubjectChange(e.target.value)}
              >
                {availableSubjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="School Year"
              variant="outlined"
              value={formData.schoolYear}
              onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddClass} 
            variant="contained"
            disabled={!formData.className || !formData.subjectId || loading}
          >
            {loading ? 'Adding...' : 'Add Class'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Students Modal */}
      <TeacherClassDetails 
        open={openStudentsModal} 
        onClose={() => setOpenStudentsModal(false)} 
        teacherClass={selectedTeacherClass} 
      />
    </Box>
  );
} 