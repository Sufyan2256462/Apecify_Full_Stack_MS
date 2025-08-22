import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, TablePagination, Checkbox, Tooltip, TableSortLabel, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_URL = 'http://localhost:5000/api/teachers';

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

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    department: '', name: '', username: '', password: '', email: '', phone: '', isActive: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTeachers = async () => {
    const res = await axios.get(API_URL);
    setTeachers(res.data);
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const handleOpen = (teacher = null) => {
    if (teacher) {
      setEditId(teacher._id);
      setForm({ ...teacher });
    } else {
      setEditId(null);
      setForm({ department: '', name: '', username: '', password: '', email: '', phone: '', isActive: true });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ department: '', name: '', username: '', password: '', email: '', phone: '', isActive: true });
    setEditId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setSnackbar({ open: true, message: 'Teacher updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, form);
        setSnackbar({ open: true, message: 'Teacher added!', severity: 'success' });
      }
      fetchTeachers();
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving teacher', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSnackbar({ open: true, message: 'Teacher deleted!', severity: 'success' });
      fetchTeachers();
      setSelected(selected.filter(sel => sel !== id));
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting teacher', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected teachers?')) return;
    try {
      await Promise.all(selected.map(id => axios.delete(`${API_URL}/${id}`)));
      setSnackbar({ open: true, message: 'Selected teachers deleted!', severity: 'success' });
      fetchTeachers();
      setSelected([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting selected teachers', severity: 'error' });
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      await axios.patch(`${API_URL}/${id}/status`, { isActive });
      setSnackbar({ open: true, message: `Teacher ${isActive ? 'activated' : 'deactivated'}!`, severity: 'success' });
      fetchTeachers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const filtered = teachers.filter(teacher =>
    (statusFilter === 'All' || (statusFilter === 'activated' ? teacher.isActive : !teacher.isActive)) &&
    (teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.username.toLowerCase().includes(search.toLowerCase()) ||
      teacher.department.toLowerCase().includes(search.toLowerCase()))
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

  const handleExportCSV = () => {
    const headers = ['Name', 'Department', 'Username', 'Email', 'Status'];
    const rows = sorted.map(teacher => [
      teacher.name,
      teacher.department,
      teacher.username,
      teacher.email,
      teacher.isActive ? 'Activated' : 'Deactivated'
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'teachers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Teacher List</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mr: 1 }}>
            Add Teacher
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
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant={statusFilter === 'All' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('All')}>All</Button>
          <Button variant={statusFilter === 'activated' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('activated')}>Activated</Button>
          <Button variant={statusFilter === 'deactivated' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('deactivated')}>Deactivated</Button>
          <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
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
                  inputProps={{ 'aria-label': 'select all teachers' }}
                />
              </TableCell>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                  hideSortIcon={false}
                >
                  NAME
                </TableSortLabel>
              </TableCell>
              <TableCell>DEPARTMENT</TableCell>
              <TableCell>USERNAME</TableCell>
              <TableCell>EMAIL</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((teacher, idx) => {
              const isItemSelected = isSelected(teacher._id);
              return (
                <TableRow key={teacher._id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleClick(teacher._id)}
                    />
                  </TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>{teacher.username}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.isActive ? 'Activated' : 'Deactivated'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(teacher)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={teacher.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton color={teacher.isActive ? 'warning' : 'success'} onClick={() => handleStatusChange(teacher._id, !teacher.isActive)}>
                        {teacher.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(teacher._id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No teachers found.</TableCell>
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
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} required sx={{ minWidth: 200 }} />
            <TextField label="Username" name="username" value={form.username} onChange={handleFormChange} required sx={{ minWidth: 200 }} />
            <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} required sx={{ minWidth: 200 }} />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Department</InputLabel>
              <Select name="department" value={form.department} label="Department" onChange={handleFormChange} required>
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept.department}>
                    {dept.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Password" name="password" value={form.password} onChange={handleFormChange} type="password" sx={{ minWidth: 200 }} />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select name="isActive" value={form.isActive} label="Status" onChange={handleFormChange} required>
                <MenuItem value={true}>Activated</MenuItem>
                <MenuItem value={false}>Deactivated</MenuItem>
              </Select>
            </FormControl>
          </Box>
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