import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, TablePagination, Checkbox, Tooltip, Autocomplete, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_URL = 'http://localhost:5000/api/contents';

// Custom CKEditor config for image upload
const editorConfig = {
  simpleUpload: {
    uploadUrl: 'http://localhost:5000/api/contents/upload-image',
    headers: {},
  },
};

export default function Content() {
  const [contents, setContents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', categories: [], attachments: [], images: [], videos: [] });
  const [preview, setPreview] = useState(null);
  const [fileInputs, setFileInputs] = useState({ attachments: [], images: [], videos: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const fetchContents = async () => {
    const res = await axios.get(API_URL);
    setContents(res.data);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleOpen = (content = null) => {
    if (content) {
      setEditId(content._id);
      setForm({
        title: content.title,
        content: content.content,
        categories: Array.isArray(content.categories) ? content.categories : [],
        attachments: content.attachments || [],
        images: content.images || [],
        videos: content.videos || [],
      });
      setFileInputs({ attachments: [], images: [], videos: [] });
    } else {
      setEditId(null);
      setForm({ title: '', content: '', categories: [], attachments: [], images: [], videos: [] });
      setFileInputs({ attachments: [], images: [], videos: [] });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ title: '', content: '' });
    setEditId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFileInputs(prev => ({ ...prev, [name]: Array.from(files) }));
  };

  const handleCategoriesChange = (event, value) => {
    setForm(f => ({ ...f, categories: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('content', form.content);
      form.categories.forEach(cat => data.append('categories', cat));
      fileInputs.attachments.forEach(f => data.append('attachments', f));
      fileInputs.images.forEach(f => data.append('images', f));
      fileInputs.videos.forEach(f => data.append('videos', f));
      let res;
      if (editId) {
        res = await axios.put(`${API_URL}/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Content updated!', severity: 'success' });
      } else {
        res = await axios.post(API_URL, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Content added!', severity: 'success' });
      }
      fetchContents();
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving content', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSnackbar({ open: true, message: 'Content deleted!', severity: 'success' });
      fetchContents();
      setSelected(selected.filter(sel => sel !== id));
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting content', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected contents?')) return;
    try {
      await Promise.all(selected.map(id => axios.delete(`${API_URL}/${id}`)));
      setSnackbar({ open: true, message: 'Selected contents deleted!', severity: 'success' });
      fetchContents();
      setSelected([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting selected contents', severity: 'error' });
    }
  };

  const filtered = contents.filter(content =>
    content.title.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const handleExportCSV = () => {
    const headers = ['Title', 'Content'];
    const rows = filtered.map(content => [content.title, content.content.replace(/\n|\r|\t|,/g, ' ')]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => '"' + (val || '') + '"').join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'contents.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Content List</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mr: 1 }}>
            Add Content
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
        <Button variant="contained" color="info" startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
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
                  inputProps={{ 'aria-label': 'select all contents' }}
                />
              </TableCell>
              <TableCell>TITLE</TableCell>
              <TableCell>CREATED</TableCell>
              <TableCell>UPDATED</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((content, idx) => {
              const isItemSelected = isSelected(content._id);
              return (
                <TableRow key={content._id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleClick(content._id)}
                    />
                  </TableCell>
                  <TableCell>{content.title}</TableCell>
                  <TableCell>{new Date(content.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(content.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Preview">
                      <IconButton color="info" onClick={() => setPreview(content)}><VisibilityIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(content)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(content._id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No content found.</TableCell>
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit Content' : 'Add Content'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={Array.isArray(form.categories) ? form.categories : []}
            onChange={handleCategoriesChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Categories (comma separated or select)" sx={{ mb: 2 }} />
            )}
            sx={{ mb: 2 }}
          />
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={form.content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setForm(f => ({ ...f, content: data }));
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Attachments</Typography>
            <input type="file" name="attachments" multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Images</Typography>
            <input type="file" name="images" multiple onChange={handleFileChange} accept="image/*" />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Videos</Typography>
            <input type="file" name="videos" multiple onChange={handleFileChange} accept="video/*" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
        <DialogTitle>Content Preview</DialogTitle>
        <DialogContent>
          {preview && (
            <Box>
              <Typography variant="h6">{preview.title}</Typography>
              <Box sx={{ mb: 2 }} dangerouslySetInnerHTML={{ __html: preview.content }} />
              {preview.categories && preview.categories.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Categories:</Typography>
                  {preview.categories.map((cat, i) => <Chip key={i} label={cat} sx={{ mr: 1, mb: 1 }} />)}
                </Box>
              )}
              {preview.images && preview.images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Images:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {preview.images.map((img, i) => (
                      <img key={i} src={`http://localhost:5000${img}`} alt="content-img" style={{ maxWidth: 120, maxHeight: 120, marginRight: 8 }} />
                    ))}
                  </Box>
                </Box>
              )}
              {preview.videos && preview.videos.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Videos:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {preview.videos.map((vid, i) => (
                      <video key={i} src={`http://localhost:5000${vid}`} controls style={{ maxWidth: 240, maxHeight: 160, marginRight: 8 }} />
                    ))}
                  </Box>
                </Box>
              )}
              {preview.attachments && preview.attachments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Attachments:</Typography>
                  <ul>
                    {preview.attachments.map((att, i) => (
                      <li key={i}><a href={`http://localhost:5000${att}`} target="_blank" rel="noopener noreferrer">Download {att.split('/').pop()}</a></li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(null)}>Close</Button>
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