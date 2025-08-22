import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, Alert, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  FormControl, InputLabel, Select, MenuItem, Chip, Grid, Card, CardContent,
  Tabs, Tab, Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, Add as AddIcon, Download as DownloadIcon,
  Event as EventIcon, Schedule as ScheduleIcon, Assignment as AssignmentIcon,
  School as SchoolIcon, Description as DescriptionIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

export default function ClassCalendar({ teacherClass }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('event');
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1976d2');
  const [duration, setDuration] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const eventTypes = [
    { value: 'event', label: 'General Event', icon: <EventIcon />, color: '#1976d2' },
    { value: 'timetable', label: 'Timetable', icon: <ScheduleIcon />, color: '#2e7d32' },
    { value: 'datesheet', label: 'Datesheet', icon: <DescriptionIcon />, color: '#ed6c02' },
    { value: 'exam', label: 'Exam', icon: <SchoolIcon />, color: '#d32f2f' },
    { value: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, color: '#7b1fa2' },
    { value: 'holiday', label: 'Holiday', icon: <EventIcon />, color: '#f57c00' }
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching events for teacherClass:', teacherClass._id);
      const res = await axios.get(`/api/teacher-classes/${teacherClass._id}/events`);
      console.log('Events fetched:', res.data.length);
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherClass?._id) fetchEvents();
    // eslint-disable-next-line
  }, [teacherClass?._id]);

  const handleAddEvent = async () => {
    if (!title || !start) return;
    setAdding(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating event for teacherClass:', teacherClass._id);
      console.log('Event data:', { title, start, end: end || start, eventType: selectedEventType });
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('start', start);
      formData.append('end', end || start);
      formData.append('description', description);
      formData.append('color', color);
      formData.append('eventType', selectedEventType);
      formData.append('createdBy', 'Teacher');
      
      if (duration) formData.append('duration', duration);
      if (totalMarks) formData.append('totalMarks', totalMarks);
      if (instructions) formData.append('instructions', instructions);
      
      if (selectedFile && ['timetable', 'datesheet'].includes(selectedEventType)) {
        formData.append('file', selectedFile);
        await axios.post(`/api/teacher-classes/${teacherClass._id}/events/with-file`, formData);
      } else {
        await axios.post(`/api/teacher-classes/${teacherClass._id}/events`, {
          title, start, end: end || start, description, color, 
          eventType: selectedEventType, duration, totalMarks, instructions,
          createdBy: 'Teacher'
        });
      }

      setTitle(''); setStart(''); setEnd(''); setDescription('');
      setColor('#1976d2'); setDuration(''); setTotalMarks(''); setInstructions('');
      setSelectedFile(null); setSelectedEventType('event');
      setSuccess('Event added successfully!');
      setOpenDialog(false);
      fetchEvents();
    } catch (err) {
      setError('Failed to add event');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`/api/teacher-classes/${teacherClass._id}/events/${id}`);
      fetchEvents();
    } catch {}
  };

  const handleDownload = async (event) => {
    if (!event.fileUrl) return;
    try {
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
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const getEventTypeColor = (eventType) => {
    const type = eventTypes.find(t => t.value === eventType);
    return type ? type.color : '#1976d2';
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 0) return true; // All events
    const tabEventTypes = ['event', 'timetable', 'datesheet', 'exam', 'assignment', 'holiday'];
    return event.eventType === tabEventTypes[activeTab - 1];
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Class Calendar</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Events" />
        {eventTypes.map((type, index) => (
          <Tab key={type.value} label={type.label} />
        ))}
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={filteredEvents.map(e => ({
              id: e._id,
              title: e.title,
              start: e.start,
              end: e.end,
              backgroundColor: getEventTypeColor(e.eventType),
              borderColor: getEventTypeColor(e.eventType),
              extendedProps: { 
                description: e.description,
                eventType: e.eventType,
                fileUrl: e.fileUrl,
                fileName: e.fileName
              }
            }))}
            eventContent={renderEventContent}
            height="auto"
          />

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Event List</Typography>
            <Grid container spacing={2}>
              {filteredEvents.map(event => (
                <Grid item xs={12} md={6} lg={4} key={event._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {eventTypes.find(t => t.value === event.eventType)?.icon}
                          <Typography variant="h6">{event.title}</Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(event._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Chip 
                        label={eventTypes.find(t => t.value === event.eventType)?.label || 'Event'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      {event.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {event.description}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
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
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(event)}
                          sx={{ mt: 1 }}
                        >
                          Download {event.fileName || 'File'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  label="Event Type"
                >
                  {eventTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField 
                label="Title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                fullWidth 
                required 
              />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                label="Start Date" 
                type="datetime-local" 
                value={start} 
                onChange={e => setStart(e.target.value)} 
                fullWidth 
                required
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                label="End Date" 
                type="datetime-local" 
                value={end} 
                onChange={e => setEnd(e.target.value)} 
                fullWidth
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>

            <Grid item xs={12}>
              <TextField 
                label="Description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                fullWidth 
                multiline 
                rows={3} 
              />
            </Grid>

            {['exam', 'assignment'].includes(selectedEventType) && (
              <>
                <Grid item xs={6}>
                  <TextField 
                    label="Duration (minutes)" 
                    type="number" 
                    value={duration} 
                    onChange={e => setDuration(e.target.value)} 
                    fullWidth 
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    label="Total Marks" 
                    type="number" 
                    value={totalMarks} 
                    onChange={e => setTotalMarks(e.target.value)} 
                    fullWidth 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Instructions" 
                    value={instructions} 
                    onChange={e => setInstructions(e.target.value)} 
                    fullWidth 
                    multiline 
                    rows={2} 
                  />
                </Grid>
              </>
            )}

            {['timetable', 'datesheet'].includes(selectedEventType) && (
              <Grid item xs={12}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Upload timetable or datesheet file (PDF, Word, Excel, or Image)
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField 
                label="Color" 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)} 
                fullWidth
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddEvent} 
            variant="contained" 
            disabled={adding || !title || !start}
          >
            {adding ? 'Adding...' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function renderEventContent(eventInfo) {
  return (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
        {eventInfo.event.title}
      </Typography>
      {eventInfo.event.extendedProps.description && (
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>
          {eventInfo.event.extendedProps.description}
        </Typography>
      )}
    </Box>
  );
} 