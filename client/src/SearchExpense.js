import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TableSortLabel from '@mui/material/TableSortLabel';

const API_URL = 'http://localhost:5000/api/expenses';

export default function SearchExpense() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');

  const fetchExpenses = async () => {
    const res = await axios.get(API_URL, {
      params: {
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: page + 1,
        limit: rowsPerPage
      }
    });
    setExpenses(res.data.expenses);
    setTotal(res.data.total);
  };

  useEffect(() => { fetchExpenses(); }, [search, startDate, endDate, page, rowsPerPage]);

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
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 2, minWidth: 900 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Expense List</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField label="From Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          <TextField label="To Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          <Button variant="contained" onClick={() => { setPage(0); fetchExpenses(); }}>Search</Button>
          <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          <TextField label="Search" size="small" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} sx={{ ml: 'auto', width: 200 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.sort((a, b) => {
                if (orderBy === 'amount') return order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
                if (orderBy === 'date') return order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
                if (orderBy === 'name') return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                return 0;
              }).map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.name}</TableCell>
                  <TableCell>{exp.amount}</TableCell>
                  <TableCell>{exp.date ? new Date(exp.date).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{exp.description}</TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No expenses found.</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell align="right"><b>Total:</b></TableCell>
                <TableCell><b>{totalAmount}</b></TableCell>
                <TableCell colSpan={2}></TableCell>
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
    </Box>
  );
} 