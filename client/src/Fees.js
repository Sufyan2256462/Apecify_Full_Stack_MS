import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, MenuItem, Select, InputLabel, FormControl, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';

const STUDENT_URL = 'http://localhost:5000/api/students';
const FEE_URL = 'http://localhost:5000/api/fees';

export default function Fees() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [regNo, setRegNo] = useState('');
  const [feeType, setFeeType] = useState('Monthly Fee');
  const [date, setDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [feeDetails, setFeeDetails] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totalFee, setTotalFee] = useState('');
  const [remainingFee, setRemainingFee] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [viewFeeModal, setViewFeeModal] = useState({ open: false, student: null, fee: null });
  const [editFeeModal, setEditFeeModal] = useState({ open: false, student: null, totalFee: '', remainingFee: '', regNo: '', name: '', institute: '', course: '', photo: '' });
  const [editVoucherModal, setEditVoucherModal] = useState({ open: false, voucher: null });

  useEffect(() => {
    axios.get(STUDENT_URL).then(res => setStudents(res.data));
  }, []);

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
    const student = students.find(s => s._id === e.target.value);
    setRegNo(student ? student.regNo : '');
    setTotalFee(student ? student.totalFee || '' : '');
    setRemainingFee(student ? student.remainingFee || '' : '');
    fetchFeeDetails(student ? student.regNo : '');
  };

  const fetchFeeDetails = async (regNo) => {
    if (!regNo) return setFeeDetails([]);
    const res = await axios.get(`${FEE_URL}/student/${regNo}`);
    setFeeDetails(res.data);
  };

  const handleAddFee = async () => {
    try {
      const student = students.find(s => s._id === selectedStudent);
      if (!student) return;
      await axios.post(`${FEE_URL}/monthly`, {
        studentId: student._id,
        regNo: student.regNo,
        feeType,
        feeMonth: date,
        voucherAmount: amountPaid,
        totalFee,
        remainingFee,
        date,
        status: 'Paid',
      });
      // Also update the student's totalFee and remainingFee
      await axios.put(`${STUDENT_URL}/${student._id}`, {
        totalFee,
        remainingFee,
      });
      setSnackbar({ open: true, message: 'Fee added!', severity: 'success' });
      fetchFeeDetails(student.regNo);
      setDate('');
      setAmountPaid('');
    } catch (err) {
      setSnackbar({ open: true, message: 'Error adding fee', severity: 'error' });
    }
  };

  const handlePrintVoucher = (fee) => {
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`<html><head><title>Fee Voucher</title></head><body>`);
    printWindow.document.write(`<div style='text-align:center;'>`);
    printWindow.document.write(`<h2>Fee Voucher</h2>`);
    printWindow.document.write(`<p><b>Name:</b> ${fee.studentId ? fee.studentId.name : ''}</p>`);
    printWindow.document.write(`<p><b>Reg No:</b> ${fee.regNo}</p>`);
    printWindow.document.write(`<p><b>Fee Type:</b> ${fee.feeType}</p>`);
    printWindow.document.write(`<p><b>Month:</b> ${fee.feeMonth}</p>`);
    printWindow.document.write(`<p><b>Amount:</b> ${fee.voucherAmount}</p>`);
    printWindow.document.write(`<p><b>Status:</b> ${fee.status}</p>`);
    printWindow.document.write(`</div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEditFee = (student) => {
    setEditFeeModal({
      open: true,
      student,
      totalFee: student.totalFee || '',
      remainingFee: student.remainingFee || '',
      regNo: student.regNo || '',
      name: student.name || '',
      institute: student.institute || '',
      course: student.course || '',
      photo: student.photo || '',
    });
  };
  const handleSaveEditFee = async () => {
    try {
      // Update all fields for the student (add backend route if needed)
      await axios.put(`${STUDENT_URL}/${editFeeModal.student._id}`, {
        regNo: editFeeModal.regNo,
        name: editFeeModal.name,
        institute: editFeeModal.institute,
        course: editFeeModal.course,
        totalFee: editFeeModal.totalFee,
        remainingFee: editFeeModal.remainingFee,
        photo: editFeeModal.photo,
      });
      setSnackbar({ open: true, message: 'Student details updated!', severity: 'success' });
      setEditFeeModal({ open: false, student: null, totalFee: '', remainingFee: '', regNo: '', name: '', institute: '', course: '', photo: '' });
      // Optionally refresh student list/fee details
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating student details', severity: 'error' });
    }
  };

  const handleEditVoucher = (voucher) => {
    setEditVoucherModal({ open: true, voucher: { ...voucher } });
  };
  const handleSaveEditVoucher = async () => {
    try {
      await axios.put(`${FEE_URL}/${editVoucherModal.voucher._id}`, editVoucherModal.voucher);
      setSnackbar({ open: true, message: 'Voucher updated!', severity: 'success' });
      setEditVoucherModal({ open: false, voucher: null });
      fetchFeeDetails(regNo);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating voucher', severity: 'error' });
    }
  };
  const handleDeleteVoucher = async (voucherId) => {
    if (!window.confirm('Are you sure you want to delete this voucher?')) return;
    try {
      await axios.delete(`${FEE_URL}/${voucherId}`);
      setSnackbar({ open: true, message: 'Voucher deleted!', severity: 'success' });
      fetchFeeDetails(regNo);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting voucher', severity: 'error' });
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.regNo.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box sx={{ minWidth: 350, p: 2, boxShadow: 3, bgcolor: '#fff', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Add Monthly Fee</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Student</InputLabel>
          <Select value={selectedStudent} label="Student" onChange={handleStudentChange}>
            <MenuItem value="">Select Student</MenuItem>
            {students.map(s => (
              <MenuItem key={s._id} value={s._id}>{s.name} ({s.regNo})</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Reg Number" value={regNo} fullWidth sx={{ mb: 2 }} disabled />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Fee Type</InputLabel>
          <Select value={feeType} label="Fee Type" onChange={e => setFeeType(e.target.value)}>
            <MenuItem value="Monthly Fee">Monthly Fee</MenuItem>
            <MenuItem value="Registration Fee">Registration Fee</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ mb: 2 }} />
        <TextField label="Amount Paid" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Total Fee" value={totalFee} onChange={e => setTotalFee(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Remaining Fee" value={remainingFee} onChange={e => setRemainingFee(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <Button variant="contained" onClick={handleAddFee}>Add Fee</Button>
      </Box>
      <Box sx={{ flex: 1, p: 2, boxShadow: 3, bgcolor: '#fff', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Student Fee Details</Typography>
        <TextField label="Search Students" value={searchStudent} onChange={e => setSearchStudent(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PHOTO</TableCell>
                <TableCell>NAME</TableCell>
                <TableCell>REG NO</TableCell>
                <TableCell>INSTITUTE</TableCell>
                <TableCell>COURSE</TableCell>
                <TableCell>TOTAL FEE</TableCell>
                <TableCell>TOTAL VOUCHER</TableCell>
                <TableCell>TOTAL PAID</TableCell>
                <TableCell>REMAINING FEE</TableCell>
                <TableCell>VIEW FEE DETAILS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">No students found.</TableCell>
                </TableRow>
              )}
              {filteredStudents.map(student => {
                const studentFees = feeDetails.filter(f => f.studentId && f.studentId._id === student._id);
                const totalPaid = studentFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (f.voucherAmount || 0), 0);
                const totalVoucher = studentFees.reduce((sum, f) => sum + (f.voucherAmount || 0), 0);
                const remaining = (student.totalFee || 0) - totalPaid;
                return (
                  <TableRow key={student._id}>
                    <TableCell>{student.photo ? <img src={`http://localhost:5000/uploads/${student.photo}`} alt="" width={40} /> : null}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.regNo}</TableCell>
                    <TableCell>{student.institute}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>
                      <TextField
                        value={student.totalFee || ''}
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        disabled
                      />
                    </TableCell>
                    <TableCell>{totalVoucher}</TableCell>
                    <TableCell>{totalPaid}</TableCell>
                    <TableCell>
                      <TextField
                        value={student.remainingFee || ''}
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        disabled
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => setViewFeeModal({ open: true, student, fee: studentFees })}>View Fee Details</Button>
                      <Button variant="outlined" color="primary" sx={{ ml: 1 }} onClick={() => handleEditFee(student)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {feeDetails.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Fee Vouchers</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SER</TableCell>
                    <TableCell>VOUCHER NO</TableCell>
                    <TableCell>FEE TYPE</TableCell>
                    <TableCell>FEE MONTH</TableCell>
                    <TableCell>VOUCHER AMOUNT</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>PRINT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeDetails.map((fee, idx) => (
                    <TableRow key={fee._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{fee.voucherNo || '-'}</TableCell>
                      <TableCell>{fee.feeType}</TableCell>
                      <TableCell>{fee.feeMonth}</TableCell>
                      <TableCell>{fee.voucherAmount}</TableCell>
                      <TableCell>{fee.status}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handlePrintVoucher(fee)}><PrintIcon /></IconButton>
                        <IconButton color="primary" onClick={() => handleEditVoucher(fee)}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDeleteVoucher(fee._id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
      <Dialog open={viewFeeModal.open} onClose={() => setViewFeeModal({ open: false, student: null, fee: null })} maxWidth="md" fullWidth>
        <DialogTitle>Student Fee Details</DialogTitle>
        <DialogContent>
          {viewFeeModal.student && (
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" color="success" startIcon={<PrintIcon />} sx={{ mb: 2 }}>Print Student Fee Voucher</Button>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>Student Copy</TableCell><TableCell>( Voucher No: {viewFeeModal.fee && viewFeeModal.fee[0] ? viewFeeModal.fee[0].voucherNo : '-'} )</TableCell></TableRow>
                    <TableRow><TableCell>Name:</TableCell><TableCell>{viewFeeModal.student.name}</TableCell></TableRow>
                    <TableRow><TableCell>Reg No:</TableCell><TableCell>{viewFeeModal.student.regNo}</TableCell></TableRow>
                    <TableRow><TableCell>Course Yr & Section:</TableCell><TableCell>{viewFeeModal.student.course}</TableCell></TableRow>
                    <TableRow><TableCell>Total Paid:</TableCell><TableCell>{viewFeeModal.fee ? viewFeeModal.fee.reduce((sum, f) => sum + (f.voucherAmount || 0), 0) : 0}</TableCell></TableRow>
                    <TableRow><TableCell>Remaning Fee:</TableCell><TableCell>{viewFeeModal.student.totalFee - (viewFeeModal.fee ? viewFeeModal.fee.reduce((sum, f) => sum + (f.voucherAmount || 0), 0) : 0)}</TableCell></TableRow>
                    <TableRow><TableCell>Fee Type:</TableCell><TableCell>{viewFeeModal.fee && viewFeeModal.fee[0] ? viewFeeModal.fee[0].feeType : '-'}</TableCell></TableRow>
                    <TableRow><TableCell>Fee Month:</TableCell><TableCell>{viewFeeModal.fee && viewFeeModal.fee[0] ? viewFeeModal.fee[0].feeMonth : '-'}</TableCell></TableRow>
                    <TableRow><TableCell>Voucher Amount:</TableCell><TableCell>{viewFeeModal.fee && viewFeeModal.fee[0] ? viewFeeModal.fee[0].voucherAmount : '-'}</TableCell></TableRow>
                    <TableRow><TableCell>Status:</TableCell><TableCell>{viewFeeModal.fee && viewFeeModal.fee[0] ? viewFeeModal.fee[0].status : '-'}</TableCell></TableRow>
                    <TableRow><TableCell>Recieved By:</TableCell><TableCell>admin</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewFeeModal({ open: false, student: null, fee: null })}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editFeeModal.open} onClose={() => setEditFeeModal({ open: false, student: null, totalFee: '', remainingFee: '', regNo: '', name: '', institute: '', course: '', photo: '' })}>
        <DialogTitle>Edit Student Fee Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editFeeModal.name}
            onChange={e => setEditFeeModal({ ...editFeeModal, name: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Reg No"
            value={editFeeModal.regNo}
            onChange={e => setEditFeeModal({ ...editFeeModal, regNo: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Institute"
            value={editFeeModal.institute}
            onChange={e => setEditFeeModal({ ...editFeeModal, institute: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Course"
            value={editFeeModal.course}
            onChange={e => setEditFeeModal({ ...editFeeModal, course: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Total Fee"
            value={editFeeModal.totalFee}
            onChange={e => setEditFeeModal({ ...editFeeModal, totalFee: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Remaining Fee"
            value={editFeeModal.remainingFee}
            onChange={e => setEditFeeModal({ ...editFeeModal, remainingFee: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFeeModal({ open: false, student: null, totalFee: '', remainingFee: '', regNo: '', name: '', institute: '', course: '', photo: '' })}>Cancel</Button>
          <Button onClick={handleSaveEditFee} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editVoucherModal.open} onClose={() => setEditVoucherModal({ open: false, voucher: null })}>
        <DialogTitle>Edit Fee Voucher</DialogTitle>
        <DialogContent>
          <TextField label="Voucher No" value={editVoucherModal.voucher?.voucherNo || ''} onChange={e => setEditVoucherModal({ ...editVoucherModal, voucher: { ...editVoucherModal.voucher, voucherNo: e.target.value } })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Fee Type" value={editVoucherModal.voucher?.feeType || ''} onChange={e => setEditVoucherModal({ ...editVoucherModal, voucher: { ...editVoucherModal.voucher, feeType: e.target.value } })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Fee Month" value={editVoucherModal.voucher?.feeMonth || ''} onChange={e => setEditVoucherModal({ ...editVoucherModal, voucher: { ...editVoucherModal.voucher, feeMonth: e.target.value } })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Voucher Amount" value={editVoucherModal.voucher?.voucherAmount || ''} onChange={e => setEditVoucherModal({ ...editVoucherModal, voucher: { ...editVoucherModal.voucher, voucherAmount: e.target.value } })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Status" value={editVoucherModal.voucher?.status || ''} onChange={e => setEditVoucherModal({ ...editVoucherModal, voucher: { ...editVoucherModal.voucher, status: e.target.value } })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Date" value={editVoucherModal.voucher?.date || ''} onChange={e => setEditVoucherModal({ ...editVoucherModal, voucher: { ...editVoucherModal.voucher, date: e.target.value } })} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditVoucherModal({ open: false, voucher: null })}>Cancel</Button>
          <Button onClick={handleSaveEditVoucher} variant="contained">Save</Button>
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