import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Alert, TablePagination, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TableSortLabel from '@mui/material/TableSortLabel';

const API_URL = 'http://localhost:5000/api/expenses';

export default function AddExpense() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ name: '', amount: '', date: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');

  const fetchExpenses = async () => {
    const res = await axios.get(API_URL, { params: { search, page: page + 1, limit: rowsPerPage } });
    setExpenses(res.data.expenses);
    setTotal(res.data.total);
  };

  useEffect(() => { fetchExpenses(); }, [search, page, rowsPerPage]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setSnackbar({ open: true, message: 'Expense updated!', severity: 'success' });
      } else {
        await axios.post(API_URL, form);
        setSnackbar({ open: true, message: 'Expense added!', severity: 'success' });
      }
      setForm({ name: '', amount: '', date: '', description: '' });
      setEditId(null);
      fetchExpenses();
    } catch {
      setSnackbar({ open: true, message: 'Error saving expense', severity: 'error' });
    }
  };

  const handleEdit = (exp) => {
    setEditId(exp._id);
    setForm({
      name: exp.name,
      amount: exp.amount,
      date: exp.date ? exp.date.substring(0, 10) : '',
      description: exp.description || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await axios.delete(`${API_URL}/${id}`);
    setSnackbar({ open: true, message: 'Expense deleted!', severity: 'success' });
    fetchExpenses();
    setSelected(selected.filter(sel => sel !== id));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete selected expenses?')) return;
    await axios.post(`${API_URL}/bulk-delete`, { ids: selected });
    setSnackbar({ open: true, message: 'Selected expenses deleted!', severity: 'success' });
    fetchExpenses();
    setSelected([]);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(expenses.map((n) => n._id));
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
    const headers = ['Expense Name', 'Amount', 'Date', 'Description'];
    const rows = expenses.map(exp => [exp.name, exp.amount, exp.date ? new Date(exp.date).toLocaleDateString() : '', exp.description]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Expense List</title></head><body>');
    printWindow.document.write('<h2>Expense List</h2>');
    printWindow.document.write('<table border="1" style="width:100%;border-collapse:collapse;"><tr><th>Expense Name</th><th>Amount</th><th>Date</th><th>Description</th></tr>');
    expenses.forEach(exp => {
      printWindow.document.write(`<tr><td>${exp.name}</td><td>${exp.amount}</td><td>${exp.date ? new Date(exp.date).toLocaleDateString() : ''}</td><td>${exp.description || ''}</td></tr>`);
    });
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };
  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
      <Paper sx={{ p: 2, minWidth: 350, maxWidth: 400 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Expense</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Expense Name" name="name" value={form.name} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} required />
          <TextField label="Amount" name="amount" type="number" value={form.amount} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} required />
          <TextField label="Date" name="date" type="date" value={form.date} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} required />
          <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth>{editId ? 'Update Expense' : 'Add Expense'}</Button>
        </form>
      </Paper>
      <Paper sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Expense List</Typography>
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
                    indeterminate={selected.length > 0 && selected.length < expenses.length}
                    checked={expenses.length > 0 && selected.length === expenses.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>
                    EXPENSE NAME
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={orderBy === 'amount'} direction={orderBy === 'amount' ? order : 'asc'} onClick={() => handleSort('amount')}>
                    AMOUNT
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={orderBy === 'date'} direction={orderBy === 'date' ? order : 'asc'} onClick={() => handleSort('date')}>
                    DATE
                  </TableSortLabel>
                </TableCell>
                <TableCell>DESCRIPTION</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.sort((a, b) => {
                if (orderBy === 'amount') return order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
                if (orderBy === 'date') return order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
                if (orderBy === 'name') return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                return 0;
              }).map((exp) => {
                const isItemSelected = isSelected(exp._id);
                return (
                  <TableRow key={exp._id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} onChange={() => handleClick(exp._id)} />
                    </TableCell>
                    <TableCell>{exp.name}</TableCell>
                    <TableCell>{exp.amount}</TableCell>
                    <TableCell>{exp.date ? new Date(exp.date).toLocaleDateString() : ''}</TableCell>
                    <TableCell>{exp.description}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(exp)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(exp._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No expenses found.</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={2} align="right"><b>Total:</b></TableCell>
                <TableCell><b>{totalAmount}</b></TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
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