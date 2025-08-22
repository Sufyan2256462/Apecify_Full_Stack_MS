import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Event as EventIcon,
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

const GlobalCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = studentData._id;

  useEffect(() => {
    if (studentId) {
      fetchGlobalEvents();
    }
  }, [studentId]);

  const fetchGlobalEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all student classes first
      const classesResponse = await axios.get('/api/student-classes/student-classes', {
        params: { studentId }
      });
      
      const teacherClassIds = classesResponse.data.map(cls => cls.teacherClassId);
      
      if (teacherClassIds.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }
      
      // Fetch events for all classes
      const eventsPromises = teacherClassIds.map(classId =>
        axios.get(`/api/teacher-classes/${classId}/events`)
      );
      
      const eventsResponses = await Promise.all(eventsPromises);
      const allEvents = eventsResponses.flatMap(response => response.data);
      
      console.log('Global events response:', allEvents);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching global events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadEventFile = async (event) => {
    try {
      if (!event.fileUrl) {
        alert('No file available for download.');
        return;
      }

      const response = await axios.get(`/api/teacher-classes/events/${event._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', event.fileName || 'event-file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading event file:', error);
      alert('Failed to download event file.');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
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
        Class Calendar
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View important dates and events from all your classes
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search events..."
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

      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No events found' : 'No Events Available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms.' : 'No calendar events have been added by your teachers yet.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">
                        {event.title}
                      </Typography>
                    </Box>
                    {event.eventType && (
                      <Chip 
                        label={event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                        size="small"
                        color={
                          event.eventType === 'exam' ? 'error' :
                          event.eventType === 'assignment' ? 'secondary' :
                          event.eventType === 'timetable' ? 'success' :
                          event.eventType === 'datesheet' ? 'warning' :
                          'primary'
                        }
                      />
                    )}
                  </Box>
                  
                  {event.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>
                  )}
                  
                  {event.duration && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Duration: {event.duration} minutes
                    </Typography>
                  )}
                  
                  {event.totalMarks && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total Marks: {event.totalMarks}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {new Date(event.start).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>

                  {event.fileUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadEventFile(event)}
                      fullWidth
                    >
                      Download {event.fileName || 'File'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GlobalCalendar; 