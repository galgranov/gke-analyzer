import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private notificationCounter = new BehaviorSubject<number>(0);
  private notificationInterval: Subscription;
  
  // Sample pod names for random notifications
  private podNames = [
    'nginx-deployment-6b474476c4-2n9g6',
    'redis-master-6c7690d855-m9gsj',
    'mongodb-deployment-5d4d4d5d5d-2n9g6',
    'elasticsearch-data-0',
    'kibana-deployment-7f8b9b7b7b-2n9g6',
    'prometheus-deployment-7f8b9b7b7b-2n9g6',
    'grafana-deployment-7f8b9b7b7b-2n9g6',
    'kafka-broker-0',
    'zookeeper-0',
    'rabbitmq-cluster-0'
  ];
  
  // Sample statuses for random notifications
  private statuses = [
    { status: 'running', type: 'success', message: 'is now running' },
    { status: 'pending', type: 'warning', message: 'is pending' },
    { status: 'failed', type: 'error', message: 'has failed' },
    { status: 'succeeded', type: 'success', message: 'has completed successfully' },
    { status: 'unknown', type: 'warning', message: 'status is unknown' },
    { status: 'deleted', type: 'info', message: 'was deleted' },
    { status: 'created', type: 'info', message: 'was created' },
    { status: 'restarted', type: 'warning', message: 'was restarted' }
  ];

  constructor() {
    // Add some dummy notifications for demonstration
    this.addNotification('Pod nginx-deployment-6b474476c4-2n9g6 started successfully', 'success');
    this.addNotification('Pod redis-master-6c7690d855-m9gsj is pending', 'warning');
    this.addNotification('Pod mongodb-deployment-5d4d4d5d5d-2n9g6 was deleted', 'info');
    
    // Start interval to add random notifications every 10 seconds
    this.notificationInterval = interval(10000).subscribe(() => {
      this.addRandomNotification();
    });
  }
  
  ngOnDestroy(): void {
    if (this.notificationInterval) {
      this.notificationInterval.unsubscribe();
    }
  }
  
  private addRandomNotification(): void {
    const randomPodIndex = Math.floor(Math.random() * this.podNames.length);
    const randomStatusIndex = Math.floor(Math.random() * this.statuses.length);
    
    const podName = this.podNames[randomPodIndex];
    const status = this.statuses[randomStatusIndex];
    
    this.addNotification(`Pod ${podName} ${status.message}`, status.type as 'info' | 'success' | 'warning' | 'error');
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  getNotificationCount(): Observable<number> {
    return this.notificationCounter.asObservable();
  }

  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const newNotification: Notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notifications.getValue();
    this.notifications.next([newNotification, ...currentNotifications]);
    
    // Update unread count
    this.updateUnreadCount();
  }

  markAsRead(id: string): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });

    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = currentNotifications.map(notification => {
      return { ...notification, read: true };
    });

    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== id
    );

    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  clearAllNotifications(): void {
    this.notifications.next([]);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const currentNotifications = this.notifications.getValue();
    const unreadCount = currentNotifications.filter(notification => !notification.read).length;
    this.notificationCounter.next(unreadCount);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Method to notify when a pod status changes
  notifyPodStatusChange(podName: string, status: string): void {
    let type: 'info' | 'success' | 'warning' | 'error' = 'info';
    let message = `Pod ${podName} `;

    switch (status.toLowerCase()) {
      case 'running':
        type = 'success';
        message += 'is now running';
        break;
      case 'pending':
        type = 'warning';
        message += 'is pending';
        break;
      case 'failed':
        type = 'error';
        message += 'has failed';
        break;
      case 'succeeded':
        type = 'success';
        message += 'has completed successfully';
        break;
      case 'unknown':
        type = 'warning';
        message += 'status is unknown';
        break;
      default:
        message += `status changed to ${status}`;
    }

    this.addNotification(message, type);
  }
}
