import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, FormControl, InputLabel, Select, MenuItem, Button, Chip,
  Card, CardContent, Grid, IconButton, Tooltip, Alert, Snackbar, Collapse
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const API_URL = 'http://localhost:5000/api/logs';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filters, setFilters] = useState({
    userType: '',
    module: '',
    operation: '',
    status: '',
    username: '',
    startDate: '',
    endDate: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      
      const response = await axios.get(`${API_URL}/activity-logs`, { params });
      setLogs(response.data.logs);
      setTotalRecords(response.data.pagination.totalRecords);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setSnackbar({ open: true, message: 'Error fetching logs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/export/activity-logs?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({ open: true, message: 'Export successful', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    }
  };

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'FAILED': return 'error';
      case 'PARTIAL': return 'warning';
      default: return 'default';
    }
  };

  const getOperationColor = (operation) => {
    switch (operation) {
      case 'CREATE': return 'success';
      case 'READ': return 'info';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      case 'EXPORT': return 'primary';
      case 'IMPORT': return 'secondary';
      case 'BULK_OPERATION': return 'default';
      default: return 'default';
    }
  };

  const getModuleColor = (module) => {
    const colors = {
      'STUDENTS': 'primary',
      'TEACHERS': 'secondary',
      'CLASSES': 'success',
      'DEPARTMENTS': 'info',
      'COURSES': 'warning',
      'ANNOUNCEMENTS': 'error',
      'ASSIGNMENTS': 'default',
      'DOWNLOADABLES': 'primary',
      'QUIZZES': 'secondary',
      'FEES': 'success',
      'ATTENDANCE': 'info',
      'SYSTEM': 'warning'
    };
    return colors[module] || 'default';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>System Activity Logs</Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Username"
                value={filters.username}
                onChange={(e) => handleFilterChange('username', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>User Type</InputLabel>
                <Select
                  value={filters.userType}
                  onChange={(e) => handleFilterChange('userType', e.target.value)}
                  label="User Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Teacher">Teacher</MenuItem>
                  <MenuItem value="AdminUser">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  value={filters.module}
                  onChange={(e) => handleFilterChange('module', e.target.value)}
                  label="Module"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="STUDENTS">Students</MenuItem>
                  <MenuItem value="TEACHERS">Teachers</MenuItem>
                  <MenuItem value="CLASSES">Classes</MenuItem>
                  <MenuItem value="DEPARTMENTS">Departments</MenuItem>
                  <MenuItem value="COURSES">Courses</MenuItem>
                  <MenuItem value="ANNOUNCEMENTS">Announcements</MenuItem>
                  <MenuItem value="ASSIGNMENTS">Assignments</MenuItem>
                  <MenuItem value="DOWNLOADABLES">Downloadables</MenuItem>
                  <MenuItem value="QUIZZES">Quizzes</MenuItem>
                  <MenuItem value="FEES">Fees</MenuItem>
                  <MenuItem value="ATTENDANCE">Attendance</MenuItem>
                  <MenuItem value="SYSTEM">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Operation</InputLabel>
                <Select
                  value={filters.operation}
                  onChange={(e) => handleFilterChange('operation', e.target.value)}
                  label="Operation"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="READ">Read</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                  <MenuItem value="EXPORT">Export</MenuItem>
                  <MenuItem value="IMPORT">Import</MenuItem>
                  <MenuItem value="BULK_OPERATION">Bulk Operation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="PARTIAL">Partial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchLogs}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                fullWidth
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Expand</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>User Type</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <Fragment key={log._id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRowExpansion(log._id)}
                    >
                      {expandedRows.has(log._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>
                    <Chip label={log.userType} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.module} 
                      color={getModuleColor(log.module)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.operation} 
                      color={getOperationColor(log.operation)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Chip 
                      label={log.status} 
                      color={getStatusColor(log.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={expandedRows.has(log._id)} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Details:</Typography>
                            <Typography variant="body2">{log.details || 'No details available'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Resource ID:</Typography>
                            <Typography variant="body2">{log.resourceId || 'N/A'}</Typography>
                          </Grid>
                          {log.oldValues && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2">Old Values:</Typography>
                              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                                {JSON.stringify(log.oldValues, null, 2)}
                              </Typography>
                            </Grid>
                          )}
                          {log.newValues && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2">New Values:</Typography>
                              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                                {JSON.stringify(log.newValues, null, 2)}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 