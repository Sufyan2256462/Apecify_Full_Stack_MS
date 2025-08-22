const Notification = require('../models/Notification');

class NotificationService {
  // Create notification for new message
  static async createMessageNotification(senderId, senderType, senderName, recipientId, recipientType, messageContent) {
    try {
      const notification = new Notification({
        recipientId,
        recipientType,
        senderId,
        senderType,
        senderName,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${senderName}`,
        relatedType: 'message',
        metadata: {
          messagePreview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : '')
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating message notification:', error);
      throw error;
    }
  }

  // Create notification for new assignment
  static async createAssignmentNotification(teacherId, teacherName, studentId, assignmentTitle, classInfo) {
    try {
      const notification = new Notification({
        recipientId: studentId,
        recipientType: 'student',
        senderId: teacherId,
        senderType: 'teacher',
        senderName: teacherName,
        type: 'assignment',
        title: 'New Assignment',
        message: `New assignment "${assignmentTitle}" has been posted for ${classInfo.className} - ${classInfo.subjectName}`,
        relatedType: 'assignment',
        metadata: {
          className: classInfo.className,
          subjectName: classInfo.subjectName,
          assignmentTitle
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating assignment notification:', error);
      throw error;
    }
  }

  // Create notification for new announcement
  static async createAnnouncementNotification(teacherId, teacherName, studentIds, announcementTitle, classInfo) {
    try {
      const notifications = [];
      
      for (const studentId of studentIds) {
        const notification = new Notification({
          recipientId: studentId,
          recipientType: 'student',
          senderId: teacherId,
          senderType: 'teacher',
          senderName: teacherName,
          type: 'announcement',
          title: 'New Announcement',
          message: `New announcement "${announcementTitle}" from ${teacherName} for ${classInfo.className} - ${classInfo.subjectName}`,
          relatedType: 'announcement',
          metadata: {
            className: classInfo.className,
            subjectName: classInfo.subjectName,
            announcementTitle
          }
        });

        notifications.push(notification);
      }

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating announcement notifications:', error);
      throw error;
    }
  }

  // Create notification for new quiz
  static async createQuizNotification(teacherId, teacherName, studentIds, quizTitle, classInfo) {
    try {
      const notifications = [];
      
      for (const studentId of studentIds) {
        const notification = new Notification({
          recipientId: studentId,
          recipientType: 'student',
          senderId: teacherId,
          senderType: 'teacher',
          senderName: teacherName,
          type: 'quiz',
          title: 'New Quiz',
          message: `New quiz "${quizTitle}" has been created by ${teacherName} for ${classInfo.className} - ${classInfo.subjectName}`,
          relatedType: 'quiz',
          metadata: {
            className: classInfo.className,
            subjectName: classInfo.subjectName,
            quizTitle
          }
        });

        notifications.push(notification);
      }

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating quiz notifications:', error);
      throw error;
    }
  }

  // Create notification for new material
  static async createMaterialNotification(teacherId, teacherName, studentIds, materialTitle, classInfo) {
    try {
      const notifications = [];
      
      for (const studentId of studentIds) {
        const notification = new Notification({
          recipientId: studentId,
          recipientType: 'student',
          senderId: teacherId,
          senderType: 'teacher',
          senderName: teacherName,
          type: 'material',
          title: 'New Study Material',
          message: `New study material "${materialTitle}" has been uploaded by ${teacherName} for ${classInfo.className} - ${classInfo.subjectName}`,
          relatedType: 'material',
          metadata: {
            className: classInfo.className,
            subjectName: classInfo.subjectName,
            materialTitle
          }
        });

        notifications.push(notification);
      }

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating material notifications:', error);
      throw error;
    }
  }

  // Create notification for new event
  static async createEventNotification(teacherId, teacherName, studentIds, eventTitle, classInfo) {
    try {
      const notifications = [];
      
      for (const studentId of studentIds) {
        const notification = new Notification({
          recipientId: studentId,
          recipientType: 'student',
          senderId: teacherId,
          senderType: 'teacher',
          senderName: teacherName,
          type: 'event',
          title: 'New Event',
          message: `New event "${eventTitle}" has been scheduled by ${teacherName} for ${classInfo.className} - ${classInfo.subjectName}`,
          relatedType: 'event',
          metadata: {
            className: classInfo.className,
            subjectName: classInfo.subjectName,
            eventTitle
          }
        });

        notifications.push(notification);
      }

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating event notifications:', error);
      throw error;
    }
  }

  // Create notification for student response to teacher
  static async createStudentResponseNotification(studentId, studentName, teacherId, responseType, classInfo) {
    try {
      const notification = new Notification({
        recipientId: teacherId,
        recipientType: 'teacher',
        senderId: studentId,
        senderType: 'student',
        senderName: studentName,
        type: 'message',
        title: 'Student Response',
        message: `${studentName} has responded to your ${responseType} for ${classInfo.className} - ${classInfo.subjectName}`,
        relatedType: 'response',
        metadata: {
          className: classInfo.className,
          subjectName: classInfo.subjectName,
          responseType,
          studentName
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating student response notification:', error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(recipientId, recipientType) {
    try {
      return await Notification.countDocuments({
        recipientId,
        recipientType,
        isRead: false,
        isDeleted: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(recipientId, recipientType) {
    try {
      return await Notification.updateMany(
        {
          recipientId,
          recipientType,
          isRead: false,
          isDeleted: false
        },
        { isRead: true }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 