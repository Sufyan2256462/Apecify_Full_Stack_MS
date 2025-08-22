import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, TablePagination, Checkbox, Tooltip, TableSortLabel, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_URL = 'http://localhost:5000/api/courses';
const SEMESTERS = ['Spring', 'Summer', 'Fall', 'Winter'];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: '', title: '', units: '', semester: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('code');

  const fetchCourses = async () => {
    const res = await axios.get(API_URL);
    setCourses(res.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpen = (course = null) => {
    if (course) {
      setEditId(course._id);
      setForm({
        code: course.code || '',
        title: course.title || '',
        units: course.units || '',
        semester: course.semester || '',
        description: course.description || '',
      });
    } else {
      setEditId(null);
      setForm({ code: '', title: '', units: '', semester: '', description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ code: '', title: '', units: '', semester: '', description: '' });
    setEditId(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setSnackbar({ open: true, message: 'Course updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, form);
        setSnackbar({ open: true, message: 'Course added!', severity: 'success' });
      }
      fetchCourses();
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving course', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSnackbar({ open: true, message: 'Course deleted!', severity: 'success' });
      fetchCourses();
      setSelected(selected.filter(sel => sel !== id));
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting course', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected courses?')) return;
    try {
      await Promise.all(selected.map(id => axios.delete(`${API_URL}/${id}`)));
      setSnackbar({ open: true, message: 'Selected courses deleted!', severity: 'success' });
      fetchCourses();
      setSelected([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting selected courses', severity: 'error' });
    }
  };

  // Search, sort, and pagination logic
  const filtered = courses.filter(course =>
    course.code.toLowerCase().includes(search.toLowerCase()) ||
    course.title.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = filtered.slice().sort(getComparator(order, orderBy));
  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = paginated.map((n) => n._id);
      setSelected(newSelected);
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Course List</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mr: 1 }}>
            Add Course
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            disabled={selected.length === 0}
          >
            Delete Selected
          </Button>
        </Box>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 250 }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < paginated.length}
                  checked={paginated.length > 0 && selected.length === paginated.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all courses' }}
                />
              </TableCell>
              <TableCell sortDirection={orderBy === 'code' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleRequestSort('code')}
                  hideSortIcon={false}
                >
                  COURSE CODE
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'title' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                  hideSortIcon={false}
                >
                  COURSE TITLE
                </TableSortLabel>
              </TableCell>
              <TableCell>UNITS</TableCell>
              <TableCell>SEMESTER</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((course, idx) => {
              const isItemSelected = isSelected(course._id);
              return (
                <TableRow key={course._id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleClick(course._id)}
                    />
                  </TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.units}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(course)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(course._id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No courses found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Course Code"
            name="code"
            value={form.code}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Course Title"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Number of Units"
            name="units"
            value={form.units}
            onChange={handleFormChange}
            type="number"
            fullWidth
          />
          <TextField
            margin="dense"
            label="Semester"
            name="semester"
            value={form.semester}
            onChange={handleFormChange}
            select
            fullWidth
          >
            <MenuItem value="">Select Semester</MenuItem>
            {SEMESTERS.map((sem) => (
              <MenuItem key={sem} value={sem}>{sem}</MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Save'}</Button>
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