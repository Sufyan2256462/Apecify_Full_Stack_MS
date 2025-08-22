import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, MenuItem, Select, InputLabel, FormControl, Card, CardContent, Typography, Avatar, Grid, TextField
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

const INSTITUTE_URL = 'http://localhost:5000/api/institutes';
const COURSE_URL = 'http://localhost:5000/api/courses';
const CLASS_URL = 'http://localhost:5000/api/classes';
const STUDENT_URL = 'http://localhost:5000/api/students';

export default function StudentCard() {
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [institute, setInstitute] = useState('');
  const [course, setCourse] = useState('');
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get(INSTITUTE_URL).then(res => setInstitutes(res.data));
    axios.get(COURSE_URL).then(res => setCourses(res.data));
    axios.get(CLASS_URL).then(res => setClasses(res.data));
  }, []);

  const handleSearch = async () => {
    const params = {};
    if (institute) params.institute = institute;
    if (course) params.course = course;
    if (className) params.class = className;
    const res = await axios.get(STUDENT_URL, { params });
    setStudents(res.data);
  };

  const handlePrint = (student) => {
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`<html><head><title>Student Card</title></head><body>`);
    printWindow.document.write(`<div style='text-align:center;'>`);
    if (student.photo) printWindow.document.write(`<img src='http://localhost:5000/uploads/${student.photo}' width='100' /><br/>`);
    printWindow.document.write(`<h2>${student.name}</h2>`);
    printWindow.document.write(`<p><b>Reg No:</b> ${student.regNo}</p>`);
    printWindow.document.write(`<p><b>Institute:</b> ${student.institute}</p>`);
    printWindow.document.write(`<p><b>Course:</b> ${student.course}</p>`);
    printWindow.document.write(`<p><b>Class:</b> ${student.class}</p>`);
    printWindow.document.write(`</div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Search Students</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Institute</InputLabel>
          <Select value={institute} label="Institute" onChange={e => setInstitute(e.target.value)}>
            <MenuItem value="">Select Institute</MenuItem>
            {institutes.map(inst => (
              <MenuItem key={inst._id} value={inst.name}>{inst.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Course</InputLabel>
          <Select value={course} label="Course" onChange={e => setCourse(e.target.value)}>
            <MenuItem value="">Select Course</MenuItem>
            {courses.map(c => (
              <MenuItem key={c._id} value={c.title}>{c.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select value={className} label="Class" onChange={e => setClassName(e.target.value)}>
            <MenuItem value="">Select Class</MenuItem>
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls.name}>{cls.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>
      <Grid container spacing={2}>
        {students.length === 0 && <Typography sx={{ mt: 2, ml: 2 }}>No students found.</Typography>}
        {students.map(student => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
            <Card sx={{ minWidth: 250, textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar src={student.photo ? `http://localhost:5000/uploads/${student.photo}` : ''} alt={student.name} sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
                <Typography variant="h6">{student.name}</Typography>
                <Typography variant="body2"><b>Reg No:</b> {student.regNo}</Typography>
                <Typography variant="body2"><b>Institute:</b> {student.institute}</Typography>
                <Typography variant="body2"><b>Course:</b> {student.course}</Typography>
                <Typography variant="body2"><b>Class:</b> {student.class}</Typography>
                <Button variant="outlined" startIcon={<PrintIcon />} sx={{ mt: 1 }} onClick={() => handlePrint(student)}>Print Card</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 