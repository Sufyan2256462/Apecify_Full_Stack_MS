import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TablePagination, Tooltip, Avatar, TextField
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';

const API_URL = 'http://localhost:5000/api/students/deactivated';
const ACTIVATE_URL = 'http://localhost:5000/api/students';
const BULK_STATUS_URL = 'http://localhost:5000/api/students/bulk/status';

export default function DeactivatedStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const fetchStudents = async () => {
    const res = await axios.get(API_URL);
    setStudents(res.data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleActivate = async (id) => {
    await axios.put(`${ACTIVATE_URL}/${id}/activate`);
    fetchStudents();
  };

  const handleBulkActivate = async () => {
    await axios.put(BULK_STATUS_URL, { ids: selected, registrationStatus: 'Registered' });
    setSelected([]);
    fetchStudents();
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

  const handlePrintCertificate = (student) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Certificate</title></head><body>`);
    printWindow.document.write(`<h2 style='text-align:center;'>Certificate</h2>`);
    printWindow.document.write(`<h3 style='text-align:center;'>${student.institute}</h3>`);
    printWindow.document.write(`<p>This is to certify that <b>${student.name}</b> having Reg no <b>${student.regNo}</b> has completed the course <b>${student.course}</b> in class <b>${student.class}</b> on <b>${student.regDate}</b>.</p>`);
    if (student.photo) printWindow.document.write(`<img src='http://localhost:5000/uploads/${student.photo}' width='100' />`);
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filtered = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.regNo.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Reg No', 'Course', 'Reg Date', 'Status'];
    const rows = filtered.map(student => [
      student.name,
      student.regNo,
      student.course,
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
    link.setAttribute('download', 'deactivated_students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Student List</Typography>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0); }}
        sx={{ width: 250, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" color="success" onClick={handleBulkActivate} disabled={selected.length === 0}>Bulk Activate</Button>
        <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selected.length === paginated.length}
                  indeterminate={selected.length > 0 && selected.length < paginated.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>PHOTO</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>REG NO</TableCell>
              <TableCell>COURSE</TableCell>
              <TableCell>REG DATE</TableCell>
              <TableCell>ACTION</TableCell>
              <TableCell>ACTIVATE STUDENT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(student => {
              const isItemSelected = isSelected(student._id);
              return (
                <TableRow key={student._id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
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
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.regDate}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handlePrintCertificate(student)} startIcon={<PrintIcon />}>Print Certificate</Button>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Activate Student">
                      <IconButton color="success" onClick={() => handleActivate(student._id)}><CheckCircleIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No deactivated students found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
} 