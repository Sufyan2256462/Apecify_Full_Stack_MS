import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, List, ListItem, ListItemAvatar, ListItemText, Avatar as MuiAvatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

export default function MyStudents({ teacherClass }) {
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [adminStudents, setAdminStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAssignedStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClass._id}/students`);
      setAssignedStudents(res.data);
    } catch {
      setAssignedStudents([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchAdminStudents = async (search = '') => {
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClass._id}/admin-students`, { params: { search } });
      setAdminStudents(res.data);
    } catch {
      setAdminStudents([]);
    }
  };
  useEffect(() => {
    if (teacherClass?._id) {
      fetchAssignedStudents();
      fetchAdminStudents();
    }
    // eslint-disable-next-line
  }, [teacherClass?._id]);

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`/api/teacher-classes/${teacherClass._id}/students`, { studentId: selectedStudentId });
      setSelectedStudentId('');
      setSuccess('Student added!');
      setOpenDialog(false);
      fetchAssignedStudents();
    } catch {
      setError('Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      await axios.delete(`/api/teacher-classes/${teacherClass._id}/students/${studentId}`);
      fetchAssignedStudents();
    } catch {}
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>My Students</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setOpenDialog(true)}>
        Add Student
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {assignedStudents.length === 0 && <Typography color="text.secondary">No students assigned yet.</Typography>}
          {assignedStudents.map((student) => (
            <ListItem key={student._id} secondaryAction={
              <IconButton color="error" onClick={() => handleRemoveStudent(student._id)}><DeleteIcon /></IconButton>
            }>
              <ListItemAvatar>
                <MuiAvatar src={student.photo || ''} />
              </ListItemAvatar>
              <ListItemText primary={student.name} secondary={student.regNo} />
            </ListItem>
          ))}
        </List>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Student"
            size="small"
            fullWidth
            value={studentSearch}
            onChange={e => {
              setStudentSearch(e.target.value);
              fetchAdminStudents(e.target.value);
            }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudentId}
              label="Select Student"
              onChange={e => setSelectedStudentId(e.target.value)}
            >
              {adminStudents.filter(s => !assignedStudents.some(a => a._id === s._id)).map((student) => (
                <MenuItem key={student._id} value={student._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MuiAvatar src={student.photo || ''} sx={{ width: 24, height: 24 }} />
                    {student.name} ({student.regNo})
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained" disabled={!selectedStudentId || addLoading}>
            {addLoading ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 