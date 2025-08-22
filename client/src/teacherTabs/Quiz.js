import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Chip,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import axios from 'axios';

function emptyQuestion() {
  return { 
    question: '', 
    questionType: 'mcq',
    options: ['', '', '', ''], 
    answer: '',
    points: 1
  };
}

export default function Quiz({ teacherClass }) {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (teacherClass?.teacherId) {
      fetchClasses();
      fetchQuizzes();
    }
  }, [teacherClass]);

  const fetchClasses = async () => {
    if (!teacherClass?.teacherId) {
      console.log('No teacher ID available');
      return;
    }
    try {
      const response = await axios.get('/api/teacher-classes/classes', {
        params: { teacherId: teacherClass.teacherId }
      });
      setClasses(response.data);
      console.log('Classes loaded:', response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Failed to load classes');
    }
  };

  const fetchQuizzes = async () => {
    if (!teacherClass?.teacherId) {
      console.log('No teacher ID available');
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching quizzes for teacherId:', teacherClass.teacherId);
      const response = await axios.get('/api/teacher-classes/quizzes', {
        params: { teacherId: teacherClass.teacherId }
      });
      console.log('Quiz API response:', response.data);
      setQuizzes(response.data.quizzes || []);
      console.log('Quizzes loaded:', response.data.quizzes?.length || 0, 'quizzes');
    } catch (error) {
      console.error('Error loading quizzes:', error);
      console.error('Error details:', error.response?.data);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async () => {
    if (!title || !questions[0].question || selectedClasses.length === 0) {
      setError('Please fill in title, at least one question, and select classes');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      if (q.questionType === 'mcq') {
        if (!q.options || q.options.length < 2) {
          setError(`Question ${i + 1} needs at least 2 options`);
          return;
        }
        if (!q.answer.trim()) {
          setError(`Question ${i + 1} needs an answer`);
          return;
        }
      } else {
        if (!q.answer.trim()) {
          setError(`Question ${i + 1} needs an answer`);
          return;
        }
      }
    }

    setPosting(true);
    setError('');
    setSuccess('');

    try {
      const quizData = {
        title,
        description,
        questions,
        timeMinutes: timeMinutes ? parseInt(timeMinutes) : null,
        selectedClasses,
        createdBy: 'teacher123'
      };

      console.log('Sending quiz data:', quizData);
      
      await axios.post('/api/teacher-classes/quizzes', quizData);

      setTitle('');
      setDescription('');
      setTimeMinutes('');
      setQuestions([emptyQuestion()]);
      setSelectedClasses([]);
      setSuccess('Quiz created successfully!');
      setOpenDialog(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('Failed to create quiz: ' + (error.response?.data?.message || error.message));
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await axios.delete(`/api/teacher-classes/quizzes/${id}`);
      setSuccess('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      setError('Failed to delete quiz');
    }
  };

  const handleViewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setViewDialog(true);
  };

  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleCheckAll = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classes.map(cls => cls.teacherClassId || cls._id));
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? value : o) } : q));
  };

  const handleQuestionTypeChange = (idx, type) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { 
      ...q, 
      questionType: type,
      options: type === 'mcq' ? ['', '', '', ''] : [],
      answer: ''
    } : q));
  };

  const handleAddQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const handleRemoveQuestion = (idx) => setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);



  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quiz Management
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Available Quizzes ({quizzes.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                const response = await axios.get('/api/teacher-classes/all-quizzes');
                console.log('All quizzes test:', response.data);
                alert(`Found ${response.data.count} quizzes in database`);
              } catch (error) {
                console.error('Test failed:', error);
                alert('Test failed: ' + error.message);
              }
            }}
          >
            Test All Quizzes
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create New Quiz
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quiz Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No quizzes created yet
                  </TableCell>
                </TableRow>
              ) : (
                quizzes.map((quiz) => (
                  <TableRow key={quiz._id}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {quiz.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{quiz.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${quiz.className} - ${quiz.subjectName}`}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{quiz.questions?.length || 0} questions</TableCell>
                    <TableCell>
                      {quiz.timeMinutes ? (
                        <Chip 
                          icon={<TimerIcon />}
                          label={`${quiz.timeMinutes} min`}
                          size="small"
                          color="secondary"
                        />
                      ) : (
                        'No time limit'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(quiz.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewQuiz(quiz)} color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(quiz._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Quiz Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Quiz</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Time Limit (minutes)"
                type="number"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Classes
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedClasses.length === classes.length}
                    onChange={handleCheckAll}
                  />
                }
                label="Select All Classes"
                sx={{ mb: 2 }}
              />
              <Grid container spacing={1}>
                {classes.map((cls) => (
                  <Grid item xs={12} sm={6} key={cls._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedClasses.includes(cls.teacherClassId || cls._id)}
                          onChange={() => handleClassSelection(cls.teacherClassId || cls._id)}
                        />
                      }
                      label={`${cls.className} - ${cls.subjectName}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              {questions.map((q, idx) => (
                <Card key={idx} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Question {idx + 1}
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Question Type</InputLabel>
                    <Select
                      value={q.questionType}
                      onChange={(e) => handleQuestionTypeChange(idx, e.target.value)}
                      label="Question Type"
                    >
                      <MenuItem value="mcq">Multiple Choice</MenuItem>
                      <MenuItem value="text">Text Answer</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Question"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {q.questionType === 'mcq' && (
                    <Grid container spacing={1}>
                      {q.options.map((opt, oIdx) => (
                        <Grid item xs={12} sm={6} key={oIdx}>
                          <TextField
                            fullWidth
                            label={`Option ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  <TextField
                    fullWidth
                    label="Correct Answer"
                    value={q.answer}
                    onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  
                  <Button
                    color="error"
                    onClick={() => handleRemoveQuestion(idx)}
                    disabled={questions.length === 1}
                    sx={{ mt: 1 }}
                  >
                    Remove Question
                  </Button>
                </Card>
              ))}
              <Button onClick={handleAddQuestion} startIcon={<AddIcon />}>
                Add Question
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddQuiz} 
            variant="contained" 
            disabled={posting || !title || !questions[0].question || selectedClasses.length === 0}
          >
            {posting ? <CircularProgress size={20} /> : 'Create Quiz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Quiz Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QuizIcon />
            {selectedQuiz?.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedQuiz && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedQuiz.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip 
                  label={`${selectedQuiz.className} - ${selectedQuiz.subjectName}`}
                  color="primary"
                />
                {selectedQuiz.timeMinutes && (
                  <Chip 
                    icon={<TimerIcon />}
                    label={`${selectedQuiz.timeMinutes} minutes`}
                    color="secondary"
                  />
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Questions ({selectedQuiz.questions?.length || 0})
              </Typography>
              
              <List>
                {selectedQuiz.questions?.map((question, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {index + 1}. {question.question}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Type: {question.questionType === 'mcq' ? 'Multiple Choice' : 'Text Answer'}
                    </Typography>
                    {question.questionType === 'mcq' && question.options && (
                      <Box sx={{ ml: 2 }}>
                        {question.options.map((option, optIndex) => (
                          <Typography 
                            key={optIndex} 
                            variant="body2" 
                            sx={{ 
                              color: option === question.answer ? 'success.main' : 'text.primary',
                              fontWeight: option === question.answer ? 'bold' : 'normal'
                            }}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {option === question.answer && ' ✓'}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {question.questionType === 'text' && (
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          Answer: {question.answer}
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 