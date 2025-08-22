import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField } from '@mui/material';
import { Delete as DeleteIcon, CloudDownload as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

export default function DownloadableMaterials({ teacherClass }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClass._id}/materials`);
      setMaterials(res.data);
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherClass?._id) fetchMaterials();
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
      formData.append('uploadedBy', 'Teacher');
      await axios.post(`/api/teacher-classes/${teacherClass._id}/materials`, formData);
      setFile(null);
      setDescription('');
      setSuccess('File uploaded!');
      fetchMaterials();
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await axios.delete(`/api/teacher-classes/${teacherClass._id}/materials/${id}`);
      fetchMaterials();
    } catch {}
  };

  const handleDownload = (fileName, originalName) => {
    window.open(`/api/teacher-classes/materials/download/${fileName}`);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Downloadable Materials</Typography>
      <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Button variant="contained" component="label" startIcon={<UploadIcon />}>
          Choose File
          <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
        </Button>
        <TextField label="Description" size="small" value={description} onChange={e => setDescription(e.target.value)} />
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
                <TableCell>Uploaded By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map(mat => (
                <TableRow key={mat._id}>
                  <TableCell>{new Date(mat.dateUpload).toLocaleString()}</TableCell>
                  <TableCell>{mat.originalName}</TableCell>
                  <TableCell>{mat.description}</TableCell>
                  <TableCell>{mat.uploadedBy}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDownload(mat.fileName, mat.originalName)}><DownloadIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(mat._id)}><DeleteIcon /></IconButton>
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