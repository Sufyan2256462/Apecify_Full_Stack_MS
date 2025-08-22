import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination, Checkbox
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_URL = 'http://localhost:5000/api/events';

export default function CalendarOfEvents() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', start: '', end: '', image: null, video: null, language: '', instruction: '', country: '' });
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const fileInputImage = useRef();
  const fileInputVideo = useRef();

  const fetchEvents = async () => {
    const res = await axios.get(API_URL, { params: { search, page: page + 1, limit: rowsPerPage } });
    setEvents(res.data.events);
    setTotal(res.data.total);
  };

  useEffect(() => { fetchEvents(); }, [search, page, rowsPerPage]);

  const handleOpen = (event = null) => {
    if (event) {
      setEditId(event._id);
      setForm({
        title: event.title,
        start: event.start ? event.start.substring(0, 10) : '',
        end: event.end ? event.end.substring(0, 10) : '',
        image: null,
        video: null,
        language: event.language || '',
        instruction: event.instruction || '',
        country: event.country || ''
      });
    } else {
      setEditId(null);
      setForm({ title: '', start: '', end: '', image: null, video: null, language: '', instruction: '', country: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ title: '', start: '', end: '', image: null, video: null, language: '', instruction: '', country: '' });
    setEditId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('start', form.start);
      data.append('end', form.end);
      if (form.image) data.append('image', form.image);
      if (form.video) data.append('video', form.video);
      if (form.language) data.append('language', form.language);
      if (form.instruction) data.append('instruction', form.instruction);
      if (form.country) data.append('country', form.country);
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Event updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Event added!', severity: 'success' });
      }
      fetchEvents();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Error saving event', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await axios.delete(`${API_URL}/${id}`);
    setSnackbar({ open: true, message: 'Event deleted!', severity: 'success' });
    fetchEvents();
    setSelected(selected.filter(sel => sel !== id));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete selected events?')) return;
    await axios.post(`${API_URL}/bulk-delete`, { ids: selected });
    setSnackbar({ open: true, message: 'Selected events deleted!', severity: 'success' });
    fetchEvents();
    setSelected([]);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(events.map((n) => n._id));
      return;
    }
    setSelected([]);
  };

  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  const handleExportCSV = () => {
    const headers = ['Title', 'Start', 'End', 'Language', 'Instruction', 'Country'];
    const rows = events.map(ev => [ev.title, ev.start ? new Date(ev.start).toLocaleDateString() : '', ev.end ? new Date(ev.end).toLocaleDateString() : '', ev.language, ev.instruction, ev.country]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Event List</title></head><body>');
    printWindow.document.write('<h2>Event List</h2>');
    printWindow.document.write('<table border="1" style="width:100%;border-collapse:collapse;"><tr><th>Title</th><th>Start</th><th>End</th><th>Language</th><th>Instruction</th><th>Country</th></tr>');
    events.forEach(ev => {
      printWindow.document.write(`<tr><td>${ev.title}</td><td>${ev.start ? new Date(ev.start).toLocaleDateString() : ''}</td><td>${ev.end ? new Date(ev.end).toLocaleDateString() : ''}</td><td>${ev.language || ''}</td><td>${ev.instruction || ''}</td><td>${ev.country || ''}</td></tr>`);
    });
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // FullCalendar event data
  const calendarEvents = events.map(ev => ({
    id: ev._id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    extendedProps: { image: ev.image, video: ev.video }
  }));

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', gap: 4 }}>
      <Paper sx={{ flex: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Calendar</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm({ title: '', start: '', end: '', image: null, video: null, language: '', instruction: '', country: '' }); setOpen(true); }}>
            Add Event
          </Button>
        </Box>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={calendarEvents}
          selectable
          editable={false}
          eventClick={info => {
            const ev = events.find(e => e._id === info.event.id);
            handleOpen(ev);
          }}
          dateClick={info => {
            setForm(f => ({ ...f, start: info.dateStr, end: info.dateStr }));
            setOpen(true);
          }}
        />
      </Paper>
      <Paper sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Event List</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button variant="contained" color="error" onClick={handleBulkDelete} disabled={selected.length === 0}>Delete</Button>
          <Box>
            <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ mr: 1 }}>Export CSV</Button>
            <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          </Box>
          <TextField label="Search" size="small" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} sx={{ width: 200 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < events.length}
                    checked={events.length > 0 && selected.length === events.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>TITLE</TableCell>
                <TableCell>START</TableCell>
                <TableCell>END</TableCell>
                <TableCell>IMAGE</TableCell>
                <TableCell>VIDEO</TableCell>
                <TableCell>LANGUAGE</TableCell>
                <TableCell>INSTRUCTION</TableCell>
                <TableCell>COUNTRY</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(ev => {
                const isItemSelected = isSelected(ev._id);
                return (
                  <TableRow key={ev._id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} onChange={() => handleClick(ev._id)} />
                    </TableCell>
                    <TableCell>{ev.title}</TableCell>
                    <TableCell>{ev.start ? new Date(ev.start).toLocaleDateString() : ''}</TableCell>
                    <TableCell>{ev.end ? new Date(ev.end).toLocaleDateString() : ''}</TableCell>
                    <TableCell>
                      {ev.image && <img src={`http://localhost:5000${ev.image}`} alt="event-img" style={{ maxWidth: 60, maxHeight: 40 }} />}
                    </TableCell>
                    <TableCell>
                      {ev.video && <video src={`http://localhost:5000${ev.video}`} controls style={{ maxWidth: 80, maxHeight: 50 }} />}
                    </TableCell>
                    <TableCell>{ev.language}</TableCell>
                    <TableCell>{ev.instruction}</TableCell>
                    <TableCell>{ev.country}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpen(ev)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(ev._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No events found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </TableContainer>
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Date Start" name="start" type="date" value={form.start} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField label="Date End" name="end" type="date" value={form.end} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Image</Typography>
            <input type="file" name="image" accept="image/*" ref={fileInputImage} onChange={handleFormChange} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Video</Typography>
            <input type="file" name="video" accept="video/*" ref={fileInputVideo} onChange={handleFormChange} />
          </Box>
          <TextField label="Language" name="language" value={form.language} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Instruction" name="instruction" value={form.instruction} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Country" name="country" value={form.country} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
          {editId && (
            <>
              {events.find(ev => ev._id === editId)?.image && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Current Image:</Typography>
                  <img src={`http://localhost:5000${events.find(ev => ev._id === editId)?.image}`} alt="event-img" style={{ maxWidth: 120, maxHeight: 80 }} />
                </Box>
              )}
              {events.find(ev => ev._id === editId)?.video && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Current Video:</Typography>
                  <video src={`http://localhost:5000${events.find(ev => ev._id === editId)?.video}`} controls style={{ maxWidth: 160, maxHeight: 100 }} />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 