import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  showNotificationPanel = false;
  unreadCount = 0;
  private subscription = new Subscription();
  private autoDismissTime = 5000; // 5 seconds

  constructor(
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.subscription.add(
      this.notificationService.getNotifications().subscribe(notifications => {
        this.notifications = notifications;
        
        // Auto-dismiss toast notifications after a delay
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          // Set a timer to auto-dismiss the newest notification
          const newestNotification = unreadNotifications[0];
          this.subscription.add(
            timer(this.autoDismissTime).subscribe(() => {
              this.notificationService.markAsRead(newestNotification.id);
            })
          );
        }
      })
    );

    // Subscribe to notification count
    this.subscription.add(
      this.notificationService.getNotificationCount().subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.removeNotification(id);
  }

  clearAllNotifications(): void {
    this.notificationService.clearAllNotifications();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';
      case 'warning':
        return 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z';
      case 'error':
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';
      case 'info':
      default:
        return 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
}
