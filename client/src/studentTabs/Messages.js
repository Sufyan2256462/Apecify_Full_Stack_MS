import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Mail as MailIcon,
  Person as PersonIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

const Messages = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [recipients, setRecipients] = useState({ teachers: [], students: [] });
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [recipientType, setRecipientType] = useState('Teacher');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');

  useEffect(() => {
    fetchRecipients();
    fetchMessages();
  }, []);

  const fetchRecipients = async () => {
    try {
      const response = await axios.get('/api/messages/recipients');
      setRecipients(response.data);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const fetchMessages = async () => {
    if (!studentData._id) return;
    
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        axios.get(`/api/messages/sent/${studentData._id}/student`),
        axios.get(`/api/messages/received/${studentData._id}/student`)
      ]);
      
      setSentMessages(sentRes.data);
      setReceivedMessages(receivedRes.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRecipient || !message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const recipient = [...recipients.teachers, ...recipients.students]
        .find(r => r.id === selectedRecipient);

      await axios.post('/api/messages/send', {
        senderId: studentData._id,
        senderModel: 'Student',
        senderName: studentData.name,
        recipientId: selectedRecipient,
        recipientModel: recipientType,
        recipientName: recipient.name,
        subject,
        message
      });

      setSuccess('Message sent successfully!');
      setOpenDialog(false);
      setSubject('');
      setMessage('');
      setSelectedRecipient('');
      fetchMessages();
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/read/${messageId}`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getRecipientOptions = () => {
    if (recipientType === 'Teacher') {
      return recipients.teachers;
    } else {
      return recipients.students.filter(s => s.id !== studentData._id);
    }
  };

  const renderMessageCard = (message, isSent = false) => (
    <Card key={message._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {isSent ? `To: ${message.recipientName}` : `From: ${message.senderName}`}
            </Typography>
            {message.subject && (
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Subject: {message.subject}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={isSent ? 'Sent' : message.isRead ? 'Read' : 'Unread'} 
              color={isSent ? 'primary' : message.isRead ? 'success' : 'warning'}
              size="small"
            />
            {!isSent && !message.isRead && (
              <Button
                size="small"
                onClick={() => handleMarkAsRead(message._id)}
              >
                Mark as Read
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => handleDeleteMessage(message._id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" paragraph>
          {message.message}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          {new Date(message.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Send New Message
        </Button>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Inbox" />
          <Tab label="Sent Messages" />
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Received Messages ({receivedMessages.length})
              </Typography>
              {receivedMessages.length > 0 ? (
                receivedMessages.map(message => renderMessageCard(message, false))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <MailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Messages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You haven't received any messages yet.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sent Messages ({sentMessages.length})
              </Typography>
              {sentMessages.length > 0 ? (
                sentMessages.map(message => renderMessageCard(message, true))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <SendIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Sent Messages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You haven't sent any messages yet.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Send Message Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send New Message</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Recipient Type</InputLabel>
              <Select
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value);
                  setSelectedRecipient('');
                }}
                label="Recipient Type"
              >
                <MenuItem value="Teacher">Teacher</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Recipient</InputLabel>
              <Select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                label="Recipient"
              >
                {getRecipientOptions().map((recipient) => (
                  <MenuItem key={recipient.id} value={recipient.id}>
                    {recipient.name} {recipient.regNo && `(${recipient.regNo})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject (Optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained" 
            startIcon={<SendIcon />}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages; 