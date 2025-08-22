import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, TablePagination, Checkbox, Tooltip, TableSortLabel, MenuItem, Select, InputLabel, FormControl, Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PrintIcon from '@mui/icons-material/Print';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';

const API_URL = 'http://localhost:5000/api/students';
const INSTITUTE_URL = 'http://localhost:5000/api/institutes';
const COURSE_URL = 'http://localhost:5000/api/courses';
const CLASS_URL = 'http://localhost:5000/api/classes';

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

export default function Students() {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    institute: '', course: '', class: '', regNo: '', name: '', fatherName: '', dob: '', gender: '', regDate: '', cnic: '', mobile1: '', mobile2: '', email: '', presentAddress: '', permanentAddress: '', password: '', registrationStatus: 'Registered', photo: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resetDialog, setResetDialog] = useState({ open: false, id: null, password: '' });
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchStudents = async () => {
    const res = await axios.get(API_URL);
    setStudents(res.data);
  };
  const fetchInstitutes = async () => {
    const res = await axios.get(INSTITUTE_URL);
    setInstitutes(res.data);
  };
  const fetchCourses = async () => {
    const res = await axios.get(COURSE_URL);
    setCourses(res.data);
  };
  const fetchClasses = async () => {
    const res = await axios.get(CLASS_URL);
    setClasses(res.data);
  };

  useEffect(() => {
    fetchStudents();
    fetchInstitutes();
    fetchCourses();
    fetchClasses();
  }, []);

  const handleOpen = (student = null) => {
    if (student) {
      setEditId(student._id);
      setForm({ ...student, photo: null });
      setPhotoPreview(student.photo ? `http://localhost:5000/uploads/${student.photo}` : null);
    } else {
      setEditId(null);
      setForm({
        institute: '', course: '', class: '', regNo: '', name: '', fatherName: '', dob: '', gender: '', regDate: '', cnic: '', mobile1: '', mobile2: '', email: '', presentAddress: '', permanentAddress: '', password: '', registrationStatus: 'Registered', photo: null
      });
      setPhotoPreview(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({
      institute: '', course: '', class: '', regNo: '', name: '', fatherName: '', dob: '', gender: '', regDate: '', cnic: '', mobile1: '', mobile2: '', email: '', presentAddress: '', permanentAddress: '', password: '', registrationStatus: 'Registered', photo: null
    });
    setEditId(null);
    setPhotoPreview(null);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm({ ...form, photo: files[0] });
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Student updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Student added!', severity: 'success' });
      }
      fetchStudents();
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving student', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSnackbar({ open: true, message: 'Student deleted!', severity: 'success' });
      fetchStudents();
      setSelected(selected.filter(sel => sel !== id));
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting student', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected students?')) return;
    try {
      await Promise.all(selected.map(id => axios.delete(`${API_URL}/${id}`)));
      setSnackbar({ open: true, message: 'Selected students deleted!', severity: 'success' });
      fetchStudents();
      setSelected([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting selected students', severity: 'error' });
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.put(`${API_URL}/${resetDialog.id}/reset-password`, { password: resetDialog.password });
      setSnackbar({ open: true, message: 'Password reset!', severity: 'success' });
      setResetDialog({ open: false, id: null, password: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error resetting password', severity: 'error' });
    }
  };
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { registrationStatus: status });
      setSnackbar({ open: true, message: `Student ${status.toLowerCase()}!`, severity: 'success' });
      fetchStudents();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };
  const handleBulkStatusChange = async (status) => {
    try {
      await axios.put(`${API_URL}/bulk/status`, { ids: selected, registrationStatus: status });
      setSnackbar({ open: true, message: `Selected students ${status.toLowerCase()}!`, severity: 'success' });
      fetchStudents();
      setSelected([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };
  const handlePrint = (student) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Student Details</title></head><body>`);
    printWindow.document.write(`<h2>Student Details</h2>`);
    printWindow.document.write(`<p><b>Name:</b> ${student.name}</p>`);
    printWindow.document.write(`<p><b>Reg No:</b> ${student.regNo}</p>`);
    printWindow.document.write(`<p><b>Institute:</b> ${student.institute}</p>`);
    printWindow.document.write(`<p><b>Course:</b> ${student.course}</p>`);
    printWindow.document.write(`<p><b>Class:</b> ${student.class}</p>`);
    printWindow.document.write(`<p><b>Registration Status:</b> ${student.registrationStatus}</p>`);
    if (student.photo) printWindow.document.write(`<img src='http://localhost:5000/uploads/${student.photo}' width='100' />`);
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Reg No', 'Institute', 'Course', 'Class', 'Reg Date', 'Status'];
    const rows = sorted.map(student => [
      student.name,
      student.regNo,
      student.institute,
      student.course,
      student.class,
      student.regDate,
      student.registrationStatus
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search, sort, and pagination logic
  const filtered = students.filter(student =>
    (statusFilter === 'All' || student.registrationStatus === statusFilter) &&
    (student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.regNo.toLowerCase().includes(search.toLowerCase()) ||
      student.institute.toLowerCase().includes(search.toLowerCase()) ||
      student.course.toLowerCase().includes(search.toLowerCase()) ||
      student.class.toLowerCase().includes(search.toLowerCase()))
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
      <Typography variant="h5" gutterBottom>Student List</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mr: 1 }}>
            Add Student
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
          <Button variant={statusFilter === 'Registered' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('Registered')}>Registered</Button>
          <Button variant={statusFilter === 'Unregistered' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('Unregistered')}>Unregistered</Button>
          <Button variant={statusFilter === 'Deactivated' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('Deactivated')}>Deactivated</Button>
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
                  inputProps={{ 'aria-label': 'select all students' }}
                />
              </TableCell>
              <TableCell>PHOTO</TableCell>
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
              <TableCell>REG NO</TableCell>
              <TableCell>INSTITUTE</TableCell>
              <TableCell>COURSE</TableCell>
              <TableCell>CLASS</TableCell>
              <TableCell>REG DATE</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((student, idx) => {
              const isItemSelected = isSelected(student._id);
              return (
                <TableRow key={student._id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleClick(student._id)}
                    />
                  </TableCell>
                  <TableCell>
                    {student.photo ? (
                      <Avatar src={`http://localhost:5000/uploads/${student.photo}`} alt={student.name} />
                    ) : null}
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.regNo}</TableCell>
                  <TableCell>{student.institute}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.regDate}</TableCell>
                  <TableCell>{student.registrationStatus}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(student)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton color="secondary" onClick={() => setResetDialog({ open: true, id: student._id, password: '' })}><LockResetIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Print">
                      <IconButton color="info" onClick={() => handlePrint(student)}><PrintIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={student.registrationStatus === 'Deactivated' ? 'Activate' : 'Deactivate'}>
                      <IconButton color={student.registrationStatus === 'Deactivated' ? 'success' : 'warning'} onClick={() => handleStatusChange(student._id, student.registrationStatus === 'Deactivated' ? 'Registered' : 'Deactivated')}>
                        {student.registrationStatus === 'Deactivated' ? <CheckCircleIcon /> : <BlockIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(student._id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">No students found.</TableCell>
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Institute</InputLabel>
              <Select
                name="institute"
                value={form.institute}
                label="Institute"
                onChange={handleFormChange}
                required
              >
                <MenuItem value="">-- Select Institute --</MenuItem>
                {institutes.map(inst => (
                  <MenuItem key={inst._id} value={inst.name}>{inst.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Course</InputLabel>
              <Select
                name="course"
                value={form.course}
                label="Course"
                onChange={handleFormChange}
                required
              >
                <MenuItem value="">-- Select Course --</MenuItem>
                {courses.map(course => (
                  <MenuItem key={course._id} value={course.title}>{course.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Class</InputLabel>
              <Select
                name="class"
                value={form.class}
                label="Class"
                onChange={handleFormChange}
                required
              >
                <MenuItem value="">-- Select Class --</MenuItem>
                {classes.map(cls => (
                  <MenuItem key={cls._id} value={cls.name}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Reg No" name="regNo" value={form.regNo} onChange={handleFormChange} required sx={{ minWidth: 200 }} />
            <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} required sx={{ minWidth: 200 }} />
            <TextField label="Father Name" name="fatherName" value={form.fatherName} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="DOB" name="dob" value={form.dob} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={form.gender} label="Gender" onChange={handleFormChange} required>
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Reg Date" name="regDate" value={form.regDate} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
            <TextField label="CNIC" name="cnic" value={form.cnic} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="Mobile 1" name="mobile1" value={form.mobile1} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="Mobile 2" name="mobile2" value={form.mobile2} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="Present Address" name="presentAddress" value={form.presentAddress} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={handleFormChange} sx={{ minWidth: 200 }} />
            <TextField label="Password" name="password" value={form.password} onChange={handleFormChange} type="password" sx={{ minWidth: 200 }} />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Registration Status</InputLabel>
              <Select name="registrationStatus" value={form.registrationStatus} label="Registration Status" onChange={handleFormChange} required>
                <MenuItem value="Registered">Registered</MenuItem>
                <MenuItem value="Unregistered">Unregistered</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" component="label" startIcon={<PhotoCamera />} sx={{ minWidth: 200 }}>
              Upload Photo
              <input type="file" name="photo" accept="image/*" hidden onChange={handleFormChange} />
            </Button>
            {photoPreview && <Avatar src={photoPreview} alt="Preview" sx={{ width: 56, height: 56 }} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, id: null, password: '' })}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            value={resetDialog.password}
            onChange={e => setResetDialog({ ...resetDialog, password: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog({ open: false, id: null, password: '' })}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained">Reset</Button>
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