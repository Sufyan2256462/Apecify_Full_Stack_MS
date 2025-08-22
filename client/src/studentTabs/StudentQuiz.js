import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  LinearProgress,
  TextField
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Timer as TimerIcon,
  PlayArrow as StartIcon,
  CheckCircle as SubmitIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function StudentQuiz({ teacherClassId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/student-classes/class-details/${teacherClassId}`);
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [teacherClassId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleSubmitQuiz = useCallback(() => {
    const totalQuestions = selectedQuiz.questions.length;
    let correctAnswers = 0;

    selectedQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    setScore({ correct: correctAnswers, total: totalQuestions, percentage });
    setQuizCompleted(true);
    setQuizStarted(false);
  }, [selectedQuiz, answers]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, handleSubmitQuiz]);

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(quiz.timeMinutes * 60); // Convert to seconds
    setQuizStarted(true);
    setQuizCompleted(false);
    setScore(null);
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (quizStarted && selectedQuiz && selectedQuiz.questions && selectedQuiz.questions.length > 0) {
    const currentQ = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          {/* Quiz Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">{selectedQuiz.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                icon={<TimerIcon />}
                label={formatTime(timeLeft)}
                color={timeLeft < 60 ? 'error' : 'primary'}
              />
              <Typography variant="body2">
                Question {currentQuestion + 1} of {selectedQuiz.questions.length}
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mb: 3 }}
          />

          {/* Question */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentQ.question}
              </Typography>

              {currentQ.questionType === 'mcq' ? (
                <FormControl component="fieldset">
                  <RadioGroup
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                  >
                    {currentQ.options && currentQ.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Your Answer"
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                  placeholder="Type your answer here..."
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion === selectedQuiz.questions.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<SubmitIcon />}
                onClick={handleSubmitQuiz}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNextQuestion}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  if (quizCompleted && score) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Quiz Completed!
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Score: {score.correct}/{score.total} ({score.percentage}%)
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {score.percentage >= 70 ? 'Great job!' : 'Keep practicing!'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedQuiz(null);
              setQuizCompleted(false);
              setScore(null);
            }}
          >
            Back to Quizzes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Available Quizzes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Quizzes Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No quizzes have been created for this class yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {quizzes.map((quiz, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <QuizIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {quiz.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {quiz.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`${quiz.questions?.length || 0} questions`}
                      size="small"
                      color="primary"
                    />
                    {quiz.timeMinutes && (
                      <Chip 
                        icon={<TimerIcon />}
                        label={`${quiz.timeMinutes} min`}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={() => handleStartQuiz(quiz)}
                    fullWidth
                  >
                    Start Quiz
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 