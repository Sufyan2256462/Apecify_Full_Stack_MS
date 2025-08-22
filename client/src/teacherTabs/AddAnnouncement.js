import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send as PostIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';

const AddAnnouncement = ({ teacherClass }) => {
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchAnnouncements();
  }, []);

  const fetchClasses = async () => {
    try {
      const teacherId = teacherClass?.teacherId || 'teacher123';
      const response = await axios.get('/api/teacher-classes/classes', {
        params: { teacherId }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/teacher-classes/announcements');
      // Backend returns { files, total } format
      setAnnouncements(response.data.files || response.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to fetch announcements');
    }
  };

  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => (
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    ));
  };

  const handleCheckAll = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classes.map(cls => cls.teacherClassId || cls._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || selectedClasses.length === 0) {
      setError('Please enter content and select at least one class');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/teacher-classes/announcements', {
        content,
        selectedClasses
      });
      setMessage('Announcement posted successfully');
      setContent('');
      setSelectedClasses([]);
      fetchAnnouncements();
    } catch (error) {
      setError('Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get class name from teacherClassId
  const getClassName = (teacherClassId) => {
    const cls = classes.find(c => (c.teacherClassId || c._id) === (teacherClassId || teacherClassId?._id));
    return cls ? cls.className : 'Unknown';
  };

  const handleDelete = async (teacherClassId, id) => {
    try {
      await axios.delete(`/api/teacher-classes/${teacherClassId}/announcements/${id}`);
      setMessage('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      setError('Failed to delete announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditItem(announcement);
    setEditDialog(true);
  };

  const handleView = (announcement) => {
    setViewItem(announcement);
    setViewDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add Announcement
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Announcement
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Announcement Content
            </Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setContent(data);
                }}
                config={{
                  toolbar: [
                    'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
                    'bulletedList', 'numberedList', '|', 'indent', 'outdent', '|',
                    'link', 'blockQuote', 'insertTable', '|', 'undo', 'redo'
                  ]
                }}
              />
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, p: 1, bgcolor: 'primary.main', color: 'white' }}>
              Check The Class you want to put this announcement
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedClasses.length === classes.length}
                  onChange={handleCheckAll}
                />
              }
              label="Check All"
              sx={{ mb: 2 }}
            />

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>CLASS NAME</TableCell>
                    <TableCell>SUBJECT CODE</TableCell>
                    <TableCell>Select</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell>{cls.className}</TableCell>
                      <TableCell>{cls.subjectName}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selectedClasses.includes(cls.teacherClassId || cls._id)}
                          onChange={() => handleClassSelection(cls.teacherClassId || cls._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            startIcon={<PostIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Post'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Posted Announcements
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Posted</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Shared With</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement._id}>
                  <TableCell>{new Date(announcement.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div dangerouslySetInnerHTML={{ 
                      __html: announcement.content.substring(0, 100) + '...' 
                    }} />
                  </TableCell>
                  <TableCell>{getClassName(announcement.teacherClassId)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleView(announcement)} color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(announcement)} color="warning">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(announcement.teacherClassId, announcement._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Announcement Details</DialogTitle>
        <DialogContent>
          {viewItem && (
            <Box>
              <Typography><strong>Date Posted:</strong> {new Date(viewItem.date).toLocaleString()}</Typography>
              <Typography><strong>Shared With:</strong> {viewItem.sharedWith?.join(', ') || 'All Classes'}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Content:</strong></Typography>
                <div dangerouslySetInnerHTML={{ __html: viewItem.content }} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddAnnouncement; 