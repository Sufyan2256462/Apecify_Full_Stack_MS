import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';

export default function SubjectOverview({ teacherClass }) {
  const [overviews, setOverviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [currentOverview, setCurrentOverview] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (teacherClass?.teacherId) {
      fetchSubjectOverviews();
    }
  }, [teacherClass?.teacherId]);

  const fetchSubjectOverviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher-classes/teacher/${teacherClass.teacherId}/subject-overviews`);
      setOverviews(response.data);
    } catch (error) {
      console.error('Error fetching subject overviews:', error);
      setError('Failed to load subject overviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOverview?.teacherClassId) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      if (currentOverview._id) {
        // Update existing
        await axios.put(`/api/teacher-classes/${currentOverview.teacherClassId}/subject-overview`, { content });
      } else {
        // Create new
        await axios.post(`/api/teacher-classes/${currentOverview.teacherClassId}/subject-overview`, { content });
      }
      
      setSuccess('Subject overview saved successfully!');
      setEditDialog(false);
      setCurrentOverview(null);
      setContent('');
      fetchSubjectOverviews();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save subject overview.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (overview) => {
    setCurrentOverview(overview);
    setContent(overview.content || '');
    setEditDialog(true);
  };

  const handleDelete = async (overview) => {
    if (!window.confirm('Are you sure you want to delete this subject overview?')) return;
    
    try {
      await axios.delete(`/api/teacher-classes/${overview.teacherClassId}/subject-overview`);
      setSuccess('Subject overview deleted successfully!');
      fetchSubjectOverviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete subject overview.');
    }
  };

  const handleAddNew = () => {
    setCurrentOverview({ teacherClassId: teacherClass._id });
    setContent('');
    setEditDialog(true);
  };

  const handleCancel = () => {
    setEditDialog(false);
    setCurrentOverview(null);
    setContent('');
  };

  const getClassName = (teacherClassId) => {
    const overview = overviews.find(o => o.teacherClassId === teacherClassId);
    return overview?.teacherClassId?.className || 'Unknown Class';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Subject Overviews
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Overview
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {overviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Subject Overviews
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You haven't created any subject overviews yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Create Your First Overview
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {overviews.map((overview, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {getClassName(overview.teacherClassId)}
                      </Typography>
                      <Chip 
                        label="Subject Overview" 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(overview)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(overview)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {overview.content ? 
                      overview.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
                      'No content available'
                    }
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(overview.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentOverview?._id ? 'Edit Subject Overview' : 'Add New Subject Overview'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={(_, editor) => setContent(editor.getData())}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 