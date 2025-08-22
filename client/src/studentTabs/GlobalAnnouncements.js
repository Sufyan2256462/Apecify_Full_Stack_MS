import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

const GlobalAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = studentData._id;

  useEffect(() => {
    if (studentId) {
      fetchGlobalAnnouncements();
    }
  }, [studentId]);

  const fetchGlobalAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/teacher-classes/announcements', {
        params: { studentId }
      });
      
      console.log('Global announcements response:', response.data);
      setAnnouncements(response.data.files || []);
    } catch (error) {
      console.error('Error fetching global announcements:', error);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Announcements
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View announcements from all your teachers
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search announcements..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredAnnouncements.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AnnouncementIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No announcements found' : 'No Announcements Available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms.' : 'No announcements have been posted by your teachers yet.'}
          </Typography>
        </Paper>
      ) : (
        <List>
          {filteredAnnouncements.map((announcement, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                border: '1px solid #e0e0e0', 
                mb: 2, 
                borderRadius: 1,
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <AnnouncementIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        {announcement.title}
                      </Typography>
                      <Chip 
                        label={`${announcement.className || 'Unknown'} - ${announcement.subjectName || 'Unknown'}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Posted: {announcement.postedAt || new Date(announcement.date || announcement.createdAt).toLocaleDateString()}
                    </Typography>
                  }
                />
              </Box>
              
              <Box sx={{ width: '100%', pl: 7 }}>
                <Typography 
                  variant="body2" 
                  paragraph
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                  sx={{
                    '& h1, & h2, & h3, & h4, & h5, & h6': { 
                      color: 'text.primary',
                      fontWeight: 'bold',
                      mb: 1 
                    },
                    '& p': { 
                      mb: 2,
                      lineHeight: 1.6 
                    },
                    '& ul, & ol': { 
                      mb: 2,
                      pl: 2 
                    },
                    '& li': { 
                      mb: 0.5 
                    }
                  }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default GlobalAnnouncements; 