import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Badge,
  Paper,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  Quiz as QuizIcon,
  FileDownload as MaterialIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import Slider from '@mui/material/Slider';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead
  );

  const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
  const teacherId = teacherData._id;

  const audioRef = useRef(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [muted, setMuted] = useState(() => JSON.parse(localStorage.getItem('notifMuted') || 'false'));
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('notifVolume') || 1));

  useEffect(() => {
    if (teacherId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [teacherId]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (lastNotificationId && latest._id !== lastNotificationId && !latest.isRead && !muted) {
        if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.play();
        }
      }
      setLastNotificationId(latest._id);
    }
    // eslint-disable-next-line
  }, [notifications, muted, volume]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/notifications', {
        params: {
          recipientId: teacherId,
          recipientType: 'teacher',
          page: 1,
          limit: 50
        }
      });
      
      console.log('Notifications response:', response.data);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/count', {
        params: {
          recipientId: teacherId,
          recipientType: 'teacher'
        }
      });
      
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {
        recipientId: teacherId,
        recipientType: 'teacher'
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {
        recipientId: teacherId,
        recipientType: 'teacher'
      });
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        data: {
          recipientId: teacherId,
          recipientType: 'teacher'
        }
      });
      
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      setShowDeleteDialog(false);
      setSelectedNotificationId(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMenuOpen = (event, notificationId) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotificationId(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotificationId(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const handleMuteToggle = () => {
    setMuted((prev) => {
      localStorage.setItem('notifMuted', JSON.stringify(!prev));
      return !prev;
    });
  };
  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    localStorage.setItem('notifVolume', String(newValue));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageIcon />;
      case 'assignment':
        return <AssignmentIcon />;
      case 'announcement':
        return <AnnouncementIcon />;
      case 'quiz':
        return <QuizIcon />;
      case 'material':
        return <MaterialIcon />;
      case 'event':
        return <EventIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'primary';
      case 'assignment':
        return 'warning';
      case 'announcement':
        return 'info';
      case 'quiz':
        return 'error';
      case 'material':
        return 'success';
      case 'event':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={handleMuteToggle} color={muted ? 'error' : 'primary'}>
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        <Slider
          value={volume}
          min={0}
          max={1}
          step={0.01}
          onChange={handleVolumeChange}
          aria-labelledby="notification-volume-slider"
          sx={{ width: 120 }}
          disabled={muted}
        />
        <Typography variant="caption">{Math.round(volume * 100)}%</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={markAllAsRead}
              startIcon={<CheckCircleIcon />}
            >
              Mark All as Read
            </Button>
          )}
        </Box>
      </Box>
      {/* WhatsApp-like counts and filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip label={`Total: ${notifications.length}`} color="primary" />
        <Chip label={`Unread: ${notifications.filter(n => !n.isRead).length}`} color="error" />
        <Chip label={`Read: ${notifications.filter(n => n.isRead).length}`} color="success" />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>All</Button>
        <Button variant={filter === 'unread' ? 'contained' : 'outlined'} onClick={() => setFilter('unread')}>Unread</Button>
        <Button variant={filter === 'read' ? 'contained' : 'outlined'} onClick={() => setFilter('read')}>Read</Button>
      </Box>
      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any notifications yet.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : '#f0f8ff',
                    '&:hover': {
                      backgroundColor: notification.isRead ? '#f5f5f5' : '#e6f3ff'
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                    setSelectedNotification(notification);
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={notification.isRead}
                    >
                      <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            color: notification.isRead ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={getNotificationColor(notification.type)}
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, notification._id);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            From: {notification.senderName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Notification Details Dialog */}
      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${getNotificationColor(selectedNotification.type)}.main` }}>
                  {getNotificationIcon(selectedNotification.type)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedNotification.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(selectedNotification.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedNotification.message}
              </Typography>
              {selectedNotification.metadata && (
                <Box sx={{ mt: 2 }}>
                  {selectedNotification.metadata.className && (
                    <Chip
                      label={`${selectedNotification.metadata.className} - ${selectedNotification.metadata.subjectName}`}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  )}
                  {selectedNotification.metadata.messagePreview && (
                    <Typography variant="body2" color="text.secondary">
                      Preview: {selectedNotification.metadata.messagePreview}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notification Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteNotification(selectedNotificationId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications; 