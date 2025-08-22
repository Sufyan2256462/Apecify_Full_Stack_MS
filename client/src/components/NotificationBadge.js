import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  Quiz as QuizIcon,
  FileDownload as MaterialIcon,
  Event as EventIcon
} from '@mui/icons-material';
import axios from 'axios';

const NotificationBadge = ({ userType, userId, onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      fetchRecentNotifications();
    }
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/count', {
        params: {
          recipientId: userId,
          recipientType: userType
        }
      });
      
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', {
        params: {
          recipientId: userId,
          recipientType: userType,
          page: 1,
          limit: 5,
          unreadOnly: true
        }
      });
      
      setRecentNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchRecentNotifications();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    handleMenuClose();
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {
        recipientId: userId,
        recipientType: userType
      });
      
      fetchUnreadCount();
      fetchRecentNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {recentNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          recentNotifications.map((notification, index) => (
            <MenuItem
              key={notification._id}
              onClick={() => {
                markAsRead(notification._id);
                handleNotificationClick(notification);
              }}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                py: 1.5,
                px: 2
              }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: `${getNotificationColor(notification.type)}.main` 
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(notification.createdAt)}
                    </Typography>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}

        {recentNotifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  // Navigate to full notifications page
                  if (onNotificationClick) {
                    onNotificationClick({ type: 'view_all' });
                  }
                  handleMenuClose();
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBadge; 