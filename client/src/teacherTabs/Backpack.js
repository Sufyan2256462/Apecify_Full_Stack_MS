import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const API_URL = '/api/backpack';

export default function Backpack({ teacherData }) {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const teacherId = teacherData?._id || JSON.parse(localStorage.getItem('teacherData'))?._id;

  const fetchFiles = async () => {
    if (!teacherId) return;
    try {
      const res = await axios.get(`${API_URL}?teacherId=${teacherId}`);
      setFiles(res.data.files || []);
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, [teacherId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !teacherId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('teacherId', teacherId);
    try {
      await axios.post(API_URL, formData);
      setFile(null);
      setDescription('');
      fetchFiles();
    } catch (err) {
      // handle error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await axios.delete(`${API_URL}/${deletingId}`);
      setConfirmDelete(false);
      setDeletingId(null);
      fetchFiles();
    } catch (err) {
      // handle error
    }
  };

  const handleDownload = async (id, originalName) => {
    try {
      const response = await axios.get(`/api/backpack/${id}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // handle error
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Backpack</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleUpload} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <TextField
              label="File Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              {file ? file.name : 'Choose File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!file || uploading}
              sx={{ ml: 2 }}
            >
              Upload
            </Button>
          </form>
        </CardContent>
      </Card>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date Uploaded</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((f) => (
              <TableRow key={f._id}>
                <TableCell>{f.originalName}</TableCell>
                <TableCell>{f.description}</TableCell>
                <TableCell>{new Date(f.uploadDate || f.createdAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleDownload(f._id, f.originalName)}><DownloadIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setDeletingId(f._id); setConfirmDelete(true); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {files.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No files uploaded yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>Are you sure you want to delete this file?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}