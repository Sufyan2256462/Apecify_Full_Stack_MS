import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Grid
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

const CLASS_URL = 'http://localhost:5000/api/classes';
const STUDENT_URL = 'http://localhost:5000/api/students';
const FEE_REPORT_URL = 'http://localhost:5000/api/fees/report';

export default function FeeReport() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get(CLASS_URL).then(res => setClasses(res.data));
    axios.get(STUDENT_URL).then(res => setStudents(res.data));
  }, []);

  const handleSearch = async () => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await axios.get(FEE_REPORT_URL, { params });
    let filtered = res.data;
    if (classFilter) filtered = filtered.filter(f => f.studentId && f.studentId.class === classFilter);
    if (studentFilter) filtered = filtered.filter(f => f.studentId && f.studentId._id === studentFilter);
    if (statusFilter !== 'All') filtered = filtered.filter(f => f.status === statusFilter);
    if (search) filtered = filtered.filter(f =>
      (f.studentId && f.studentId.name.toLowerCase().includes(search.toLowerCase())) ||
      (f.regNo && f.regNo.toLowerCase().includes(search.toLowerCase()))
    );
    setRecords(filtered);
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Reg No', 'Class', 'Voucher No', 'Fee Type', 'Fee Month', 'Voucher Amount', 'Status', 'Date'];
    const rows = records.map(r => [
      r.studentId ? r.studentId.name : '',
      r.regNo,
      r.studentId ? r.studentId.class : '',
      r.voucherNo,
      r.feeType,
      r.feeMonth,
      r.voucherAmount,
      r.status,
      r.date
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'fee_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=600');
    printWindow.document.write('<html><head><title>Fee Report</title></head><body>');
    printWindow.document.write('<h2 style="text-align:center;">Fee Report</h2>');
    printWindow.document.write('<table border="1" style="width:100%;border-collapse:collapse;">');
    printWindow.document.write('<tr><th>Student Name</th><th>Reg No</th><th>Class</th><th>Voucher No</th><th>Fee Type</th><th>Fee Month</th><th>Voucher Amount</th><th>Status</th><th>Date</th></tr>');
    records.forEach(r => {
      printWindow.document.write('<tr>');
      printWindow.document.write(`<td>${r.studentId ? r.studentId.name : ''}</td>`);
      printWindow.document.write(`<td>${r.regNo}</td>`);
      printWindow.document.write(`<td>${r.studentId ? r.studentId.class : ''}</td>`);
      printWindow.document.write(`<td>${r.voucherNo}</td>`);
      printWindow.document.write(`<td>${r.feeType}</td>`);
      printWindow.document.write(`<td>${r.feeMonth}</td>`);
      printWindow.document.write(`<td>${r.voucherAmount}</td>`);
      printWindow.document.write(`<td>${r.status}</td>`);
      printWindow.document.write(`<td>${r.date}</td>`);
      printWindow.document.write('</tr>');
    });
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // Summary totals
  const totalFee = records.reduce((sum, r) => sum + (r.totalFee || 0), 0);
  const totalPaid = records.reduce((sum, r) => sum + (r.voucherAmount || 0), 0);
  const totalRemaining = records.reduce((sum, r) => sum + ((r.totalFee || 0) - (r.voucherAmount || 0)), 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Student Fee List</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <TextField label="From" type="date" value={from} onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item>
          <TextField label="To" type="date" value={to} onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Class</InputLabel>
            <Select value={classFilter} label="Class" onChange={e => setClassFilter(e.target.value)}>
              <MenuItem value="">All Classes</MenuItem>
              {classes.map(cls => (
                <MenuItem key={cls._id} value={cls.name}>{cls.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Student</InputLabel>
            <Select value={studentFilter} label="Student" onChange={e => setStudentFilter(e.target.value)}>
              <MenuItem value="">All Students</MenuItem>
              {students.map(s => (
                <MenuItem key={s._id} value={s._id}>{s.name} ({s.regNo})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} />
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleSearch}>Search</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV} disabled={records.length === 0}>Export CSV</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success" startIcon={<PrintIcon />} onClick={handlePrint} disabled={records.length === 0}>Print</Button>
        </Grid>
      </Grid>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Summary: Total Fee: {totalFee} | Total Paid: {totalPaid} | Total Remaining: {totalRemaining}</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PHOTO</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>REG NO</TableCell>
              <TableCell>CLASS</TableCell>
              <TableCell>VOUCHER NO</TableCell>
              <TableCell>FEE TYPE</TableCell>
              <TableCell>FEE MONTH</TableCell>
              <TableCell>VOUCHER AMOUNT</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell>DATE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell>{r.studentId && r.studentId.photo ? <img src={`http://localhost:5000/uploads/${r.studentId.photo}`} alt="" width={40} /> : null}</TableCell>
                <TableCell>{r.studentId ? r.studentId.name : ''}</TableCell>
                <TableCell>{r.regNo}</TableCell>
                <TableCell>{r.studentId ? r.studentId.class : ''}</TableCell>
                <TableCell>{r.voucherNo}</TableCell>
                <TableCell>{r.feeType}</TableCell>
                <TableCell>{r.feeMonth}</TableCell>
                <TableCell>{r.voucherAmount}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.date}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">No records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 