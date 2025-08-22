import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, TablePagination, Checkbox, Tooltip, TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_URL = 'http://localhost:5000/api/admin-users';
const LOGIN_URL = 'http://localhost:5000/api/admin-users/login';

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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', username: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('adminUser'));

  const fetchUsers = async () => {
    const res = await axios.get(API_URL);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    if (user) {
      setEditId(user._id);
      setForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        username: user.username || '',
        password: '',
      });
    } else {
      setEditId(null);
      setForm({ firstname: '', lastname: '', username: '', password: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ firstname: '', lastname: '', username: '', password: '' });
    setEditId(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setSnackbar({ open: true, message: 'Admin user updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, form);
        setSnackbar({ open: true, message: 'Admin user added!', severity: 'success' });
      }
      fetchUsers();
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving admin user', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin user?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSnackbar({ open: true, message: 'Admin user deleted!', severity: 'success' });
      fetchUsers();
      setSelected(selected.filter(sel => sel !== id));
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting admin user', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected admin users?')) return;
    try {
      await Promise.all(selected.map(id => axios.delete(`${API_URL}/${id}`)));
      setSnackbar({ open: true, message: 'Selected admin users deleted!', severity: 'success' });
      fetchUsers();
      setSelected([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting selected admin users', severity: 'error' });
    }
  };

  // Search, sort, and pagination logic
  const filtered = users.filter(user =>
    user.firstname.toLowerCase().includes(search.toLowerCase()) ||
    user.lastname.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
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

  // Login logic
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  const handleLogin = async () => {
    try {
      const res = await axios.post(LOGIN_URL, loginForm);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      setIsLoggedIn(true);
      setShowLogin(false);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Invalid credentials', severity: 'error' });
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        <TextField
          label="Username"
          name="username"
          value={loginForm.username}
          onChange={handleLoginChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={loginForm.password}
          onChange={handleLoginChange}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>Login</Button>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Admin Users List</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mr: 1 }}>
            Add User
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
                  inputProps={{ 'aria-label': 'select all users' }}
                />
              </TableCell>
              <TableCell sortDirection={orderBy === 'firstname' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'firstname'}
                  direction={orderBy === 'firstname' ? order : 'asc'}
                  onClick={() => handleRequestSort('firstname')}
                  hideSortIcon={false}
                >
                  NAME
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'username' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'username'}
                  direction={orderBy === 'username' ? order : 'asc'}
                  onClick={() => handleRequestSort('username')}
                  hideSortIcon={false}
                >
                  USERNAME
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((user, idx) => {
              const isItemSelected = isSelected(user._id);
              return (
                <TableRow key={user._id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleClick(user._id)}
                    />
                  </TableCell>
                  <TableCell>{user.firstname} {user.lastname}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(user)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(user._id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No admin users found.</TableCell>
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
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Firstname"
            name="firstname"
            value={form.firstname}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Lastname"
            name="lastname"
            value={form.lastname}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleFormChange}
            fullWidth
            required
          />
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