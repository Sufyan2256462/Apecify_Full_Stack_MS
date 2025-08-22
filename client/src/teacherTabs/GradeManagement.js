import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Publish as PublishIcon,
  VisibilityOff as VisibilityOffIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

const GradeManagement = ({ teacherClass }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    assessmentType: '',
    assessmentTitle: '',
    maxMarks: 100,
    grades: []
  });
  const [editForm, setEditForm] = useState({
    obtainedMarks: 0,
    remarks: ''
  });

  const assessmentTypes = [
    { value: 'assignment', label: 'Assignment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'midterm', label: 'Midterm' },
    { value: 'final', label: 'Final' },
    { value: 'total', label: 'Total' }
  ];

  useEffect(() => {
    if (teacherClass?._id) {
      fetchStudents();
      fetchGrades();
    }
  }, [teacherClass]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students for teacher class:', teacherClass._id);
      const response = await axios.get(`/api/grades/teacher-class/${teacherClass._id}/students`);
      console.log('Students response:', response.data);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/grades/teacher-class/${teacherClass._id}`);
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDialogOpen = () => {
    // Initialize grades array with students
    const initialGrades = students.map(student => ({
      studentId: student._id,
      studentName: student.name,
      regNo: student.regNo,
      obtainedMarks: 0,
      remarks: ''
    }));

    setUploadForm({
      assessmentType: '',
      assessmentTitle: '',
      maxMarks: 100,
      grades: initialGrades
    });
    setShowUploadDialog(true);
  };

  const handleUploadDialogClose = () => {
    setShowUploadDialog(false);
    setUploadForm({
      assessmentType: '',
      assessmentTitle: '',
      maxMarks: 100,
      grades: []
    });
  };

  const handleEditDialogOpen = (grade) => {
    setSelectedGrade(grade);
    setEditForm({
      obtainedMarks: grade.obtainedMarks,
      remarks: grade.remarks || ''
    });
    setShowEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setSelectedGrade(null);
    setEditForm({
      obtainedMarks: 0,
      remarks: ''
    });
  };

  const handleGradeChange = (studentId, field, value) => {
    setUploadForm(prev => ({
      ...prev,
      grades: prev.grades.map(grade =>
        grade.studentId === studentId
          ? { ...grade, [field]: value }
          : grade
      )
    }));
  };

  const handleUploadGrades = async () => {
    try {
      const { assessmentType, assessmentTitle, maxMarks, grades } = uploadForm;
      
      if (!assessmentType || !assessmentTitle) {
        setError('Please fill in all required fields');
        return;
      }

      const gradesToUpload = grades.filter(grade => grade.obtainedMarks > 0);
      
      if (gradesToUpload.length === 0) {
        setError('Please enter at least one grade');
        return;
      }

      const response = await axios.post('/api/grades/bulk', {
        grades: gradesToUpload,
        teacherClassId: teacherClass._id,
        assessmentType,
        assessmentTitle,
        maxMarks,
        gradedBy: 'teacher123' // Replace with actual teacher ID
      });

      console.log('Grades uploaded:', response.data);
      handleUploadDialogClose();
      fetchGrades();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error uploading grades:', error);
      setError('Failed to upload grades');
    }
  };

  const handleUpdateGrade = async () => {
    try {
      const response = await axios.put(`/api/grades/${selectedGrade._id}`, editForm);
      console.log('Grade updated:', response.data);
      handleEditDialogClose();
      fetchGrades();
    } catch (error) {
      console.error('Error updating grade:', error);
      setError('Failed to update grade');
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) {
      return;
    }

    try {
      await axios.delete(`/api/grades/${gradeId}`);
      fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
      setError('Failed to delete grade');
    }
  };

  const handlePublishGrade = async (gradeId, isPublished) => {
    try {
      await axios.patch(`/api/grades/${gradeId}/publish`, { isPublished });
      fetchGrades();
    } catch (error) {
      console.error('Error updating grade publish status:', error);
      setError('Failed to update grade status');
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    if (percentage >= 60) return 'info';
    return 'error';
  };

  const getAssessmentTypeColor = (type) => {
    switch (type) {
      case 'assignment': return 'primary';
      case 'quiz': return 'secondary';
      case 'midterm': return 'warning';
      case 'final': return 'error';
      case 'total': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Grade Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleUploadDialogOpen}
          disabled={students.length === 0}
        >
          Upload Grades
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Class Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class: {teacherClass?.className}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subject: {teacherClass?.subjectName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students: {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Grades: {grades.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published: {grades.filter(g => g.isPublished).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unpublished: {grades.filter(g => !g.isPublished).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Students Enrolled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no students enrolled in this class yet.
          </Typography>
        </Paper>
      ) : grades.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Grades Uploaded
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by uploading grades for your students.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Assessment</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {grade.studentId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {grade.assessmentTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grade.assessmentType}
                      color={getAssessmentTypeColor(grade.assessmentType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {grade.obtainedMarks}/{grade.maxMarks}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={grade.percentage}
                          color={getGradeColor(grade.percentage)}
                        />
                      </Box>
                      <Typography variant="body2">
                        {grade.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grade.grade}
                      color={getGradeColor(grade.percentage)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grade.isPublished ? 'Published' : 'Draft'}
                      color={grade.isPublished ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditDialogOpen(grade)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePublishGrade(grade._id, !grade.isPublished)}
                      >
                        {grade.isPublished ? <VisibilityOffIcon /> : <PublishIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGrade(grade._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Grades Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={handleUploadDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Grades</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assessment Type</InputLabel>
                <Select
                  value={uploadForm.assessmentType}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, assessmentType: e.target.value }))}
                  label="Assessment Type"
                >
                  {assessmentTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assessment Title"
                value={uploadForm.assessmentTitle}
                onChange={(e) => setUploadForm(prev => ({ ...prev, assessmentTitle: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Marks"
                type="number"
                value={uploadForm.maxMarks}
                onChange={(e) => setUploadForm(prev => ({ ...prev, maxMarks: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Student Grades ({students.length} students)
          </Typography>

          {students.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No students enrolled in this class.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Reg No</TableCell>
                    <TableCell>Marks</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadForm.grades.map((grade, index) => (
                    <TableRow key={grade.studentId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {grade.studentName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {grade.regNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={grade.obtainedMarks}
                          onChange={(e) => handleGradeChange(grade.studentId, 'obtainedMarks', Number(e.target.value))}
                          inputProps={{ min: 0, max: uploadForm.maxMarks }}
                          placeholder="Enter marks"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={grade.remarks}
                          onChange={(e) => handleGradeChange(grade.studentId, 'remarks', e.target.value)}
                          placeholder="Optional remarks"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadGrades} 
            variant="contained"
            disabled={students.length === 0}
          >
            Upload Grades
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Grade Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Grade</DialogTitle>
        <DialogContent>
          {selectedGrade && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Student: {selectedGrade.studentId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assessment: {selectedGrade.assessmentTitle}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Obtained Marks"
                  type="number"
                  value={editForm.obtainedMarks}
                  onChange={(e) => setEditForm(prev => ({ ...prev, obtainedMarks: Number(e.target.value) }))}
                  inputProps={{ min: 0, max: selectedGrade.maxMarks }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Marks"
                  type="number"
                  value={selectedGrade.maxMarks}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  multiline
                  rows={3}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateGrade} variant="contained">
            Update Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradeManagement; 