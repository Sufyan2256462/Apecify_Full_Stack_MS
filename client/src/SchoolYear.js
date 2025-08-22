import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Alert, TablePagination, Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TableSortLabel from '@mui/material/TableSortLabel';

const API_URL = 'http://localhost:5000/api/school-years';

export default function SchoolYear() {
  const [years, setYears] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ year: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('year');
  const [order, setOrder] = useState('asc');

  const fetchYears = async () => {
    const res = await axios.get(API_URL, { params: { search, page: page + 1, limit: rowsPerPage, sort: orderBy, order } });
    setYears(res.data.years);
    setTotal(res.data.total);
  };

  useEffect(() => { fetchYears(); }, [search, page, rowsPerPage, orderBy, order]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setSnackbar({ open: true, message: 'School year updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, form);
        setSnackbar({ open: true, message: 'School year added!', severity: 'success' });
      }
      setForm({ year: '' });
      setEditId(null);
      fetchYears();
    } catch {
      setSnackbar({ open: true, message: 'Error saving school year', severity: 'error' });
    }
  };

  const handleEdit = (y) => {
    setEditId(y._id);
    setForm({ year: y.year });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this school year?')) return;
    await axios.delete(`${API_URL}/${id}`);
    setSnackbar({ open: true, message: 'School year deleted!', severity: 'success' });
    fetchYears();
    setSelected(selected.filter(sel => sel !== id));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete selected school years?')) return;
    await axios.post(`${API_URL}/bulk-delete`, { ids: selected });
    setSnackbar({ open: true, message: 'Selected school years deleted!', severity: 'success' });
    fetchYears();
    setSelected([]);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(years.map((n) => n._id));
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
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleExportCSV = () => {
    const headers = ['School Year'];
    const rows = years.map(y => [y.year]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'school_years.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=700,height=500');
    printWindow.document.write('<html><head><title>School Year List</title></head><body>');
    printWindow.document.write('<h2>School Year List</h2>');
    printWindow.document.write('<table border="1" style="width:100%;border-collapse:collapse;"><tr><th>School Year</th></tr>');
    years.forEach(y => {
      printWindow.document.write(`<tr><td>${y.year}</td></tr>`);
    });
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
      <Paper sx={{ p: 2, minWidth: 350, maxWidth: 400 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add School Year</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="School Year" name="year" value={form.year} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} required />
          <Button type="submit" variant="contained" color="primary" fullWidth>{editId ? 'Update' : 'Add'}</Button>
        </form>
      </Paper>
      <Paper sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>School Year List</Typography>
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
                    indeterminate={selected.length > 0 && selected.length < years.length}
                    checked={years.length > 0 && selected.length === years.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel active={orderBy === 'year'} direction={orderBy === 'year' ? order : 'asc'} onClick={() => handleSort('year')}>
                    SCHOOL YEAR
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {years.map((y) => {
                const isItemSelected = isSelected(y._id);
                return (
                  <TableRow key={y._id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} onChange={() => handleClick(y._id)} />
                    </TableCell>
                    <TableCell>{y.year}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(y)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(y._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {years.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">No school years found.</TableCell>
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
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 