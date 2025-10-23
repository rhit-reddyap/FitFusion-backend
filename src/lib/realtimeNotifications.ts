// Real-time Notification System
export interface Notification {
  id: string;
  type: 'pr' | 'achievement' | 'community' | 'workout' | 'nutrition' | 'recovery';
  title: string;
  message: string;
  userId: string;
  communityId?: string;
  data?: any;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface PRNotification {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  exercise: string;
  weight: number;
  reps: number;
  previousPR: number;
  communityId: string;
  timestamp: string;
  isNew: boolean;
}

class RealtimeNotificationService {
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private prListeners: Map<string, (notification: PRNotification) => void> = new Map();
  private isConnected = false;

  // Initialize real-time connection
  async initialize(userId: string): Promise<void> {
    // In a real app, this would connect to WebSocket or Server-Sent Events
    this.isConnected = true;
    console.log(`Real-time notifications initialized for user ${userId}`);
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): string {
    const listenerId = `notifications_${userId}_${Date.now()}`;
    this.listeners.set(listenerId, callback);
    return listenerId;
  }

  // Subscribe to PR notifications
  subscribeToPRNotifications(communityId: string, callback: (notification: PRNotification) => void): string {
    const listenerId = `pr_${communityId}_${Date.now()}`;
    this.prListeners.set(listenerId, callback);
    return listenerId;
  }

  // Unsubscribe from notifications
  unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId);
    this.prListeners.delete(listenerId);
  }

  // Send notification
  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(newNotification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // Send PR notification to community
  async sendPRNotification(prData: Omit<PRNotification, 'id' | 'timestamp' | 'isNew'>): Promise<void> {
    const newPRNotification: PRNotification = {
      ...prData,
      id: `pr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isNew: true
    };

    // Notify PR listeners for this community
    this.prListeners.forEach((callback, listenerId) => {
      if (listenerId.includes(prData.communityId)) {
        try {
          callback(newPRNotification);
        } catch (error) {
          console.error('Error in PR notification callback:', error);
        }
      }
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    // In a real app, this would update the database
    console.log(`Marking notification ${notificationId} as read`);
  }

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    // In a real app, this would query the database
    return 3; // Mock count
  }

  // Get notifications for user
  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    // In a real app, this would query the database
    return [
      {
        id: '1',
        type: 'pr',
        title: 'New Personal Record!',
        message: 'You hit a new PR in Bench Press: 315 lbs × 1',
        userId,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'achievement',
        title: 'Workout Streak!',
        message: 'You\'ve completed 7 workouts in a row!',
        userId,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'community',
        title: 'Community Update',
        message: 'Alex Johnson hit a new PR in Deadlift!',
        userId,
        communityId: '1',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low'
      }
    ];
  }

  // Simulate real-time updates
  startSimulation(): void {
    if (!this.isConnected) return;

    // Simulate random notifications every 30 seconds
    setInterval(() => {
      const randomNotifications = [
        {
          type: 'pr' as const,
          title: 'New Personal Record!',
          message: 'You hit a new PR in Squat: 365 lbs × 1',
          userId: 'current_user',
          priority: 'high' as const
        },
        {
          type: 'achievement' as const,
          title: 'Volume Milestone!',
          message: 'You\'ve lifted 50,000 lbs this month!',
          userId: 'current_user',
          priority: 'medium' as const
        },
        {
          type: 'community' as const,
          title: 'Community PR!',
          message: 'Sarah Chen hit a new PR in Bench Press!',
          userId: 'current_user',
          communityId: '1',
          priority: 'low' as const
        }
      ];

      const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
      this.sendNotification(randomNotification);
    }, 30000);
  }

  // Disconnect
  disconnect(): void {
    this.isConnected = false;
    this.listeners.clear();
    this.prListeners.clear();
  }
}

export const notificationService = new RealtimeNotificationService();


















