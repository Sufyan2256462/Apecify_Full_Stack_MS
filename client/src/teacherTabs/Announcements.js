import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';

export default function Announcements({ teacherClass }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher-classes/${teacherClass._id}/announcements`);
      setAnnouncements(res.data);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherClass?._id) fetchAnnouncements();
    // eslint-disable-next-line
  }, [teacherClass?._id]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setPosting(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`/api/teacher-classes/${teacherClass._id}/announcements`, { title, content, postedBy: 'Teacher' });
      setTitle('');
      setContent('');
      setSuccess('Announcement posted!');
      fetchAnnouncements();
    } catch {
      setError('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/api/teacher-classes/${teacherClass._id}/announcements/${id}`);
      fetchAnnouncements();
    } catch {}
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Announcements</Typography>
      <Box component="form" onSubmit={handlePost} sx={{ mb: 3 }}>
        <TextField label="Title" size="small" value={title} onChange={e => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={(_, editor) => setContent(editor.getData())}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={posting || !title || !content}>
          {posting ? 'Posting...' : 'Post'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {announcements.map(a => (
            <ListItem key={a._id} alignItems="flex-start">
              <ListItemText
                primary={<><b>{a.title}</b> <span style={{ fontSize: 12, color: '#888' }}>{new Date(a.date).toLocaleString()}</span></>}
                secondary={<span dangerouslySetInnerHTML={{ __html: a.content }} />}
              />
              <ListItemSecondaryAction>
                <IconButton color="error" onClick={() => handleDelete(a._id)}><DeleteIcon /></IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
} 