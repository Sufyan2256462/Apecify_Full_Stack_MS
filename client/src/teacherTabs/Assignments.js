import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField } from '@mui/material';
import { Delete as DeleteIcon, CloudDownload as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

export default function Assignments({ teacherClass }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClass._id}/assignments`);
      setAssignments(res.data);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherClass?._id) fetchAssignments();
    // eslint-disable-next-line
  }, [teacherClass?._id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('dueDate', dueDate);
      formData.append('uploadedBy', 'Teacher');
      await axios.post(`/api/teacher-classes/${teacherClass._id}/assignments`, formData);
      setFile(null);
      setDescription('');
      setDueDate('');
      setSuccess('Assignment uploaded!');
      fetchAssignments();
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await axios.delete(`/api/teacher-classes/${teacherClass._id}/assignments/${id}`);
      fetchAssignments();
    } catch {}
  };

  const handleDownload = (fileName, originalName) => {
    window.open(`/api/teacher-classes/assignments/download/${fileName}`);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Assignments</Typography>
      <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" component="label" startIcon={<UploadIcon />}>
          Choose File
          <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
        </Button>
        <TextField label="Description" size="small" value={description} onChange={e => setDescription(e.target.value)} />
        <TextField label="Due Date" type="date" size="small" value={dueDate} onChange={e => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button type="submit" variant="contained" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        {file && <Typography variant="body2">{file.name}</Typography>}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Upload</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map(ass => (
                <TableRow key={ass._id}>
                  <TableCell>{new Date(ass.dateUpload).toLocaleString()}</TableCell>
                  <TableCell>{ass.originalName}</TableCell>
                  <TableCell>{ass.description}</TableCell>
                  <TableCell>{ass.dueDate ? new Date(ass.dueDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{ass.uploadedBy}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDownload(ass.fileName, ass.originalName)}><DownloadIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(ass._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
} 