import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

export const NotificationSeverity = {
  INFO: 'info',
  WARNING: 'warning', 
  ERROR: 'error',
  SUCCESS: 'success'
};

export const NotificationPriority = {
  SILENT: 'silent',
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export class NotificationService extends BrowserEventEmitter {
  constructor() {
    super();
    this.notifications = [];
    this.notificationId = 1;
    this.toastContainer = null;
    this.centerContainer = null;
    this.setupUI();
  }

  // Core notification API
  notify(message, severity = NotificationSeverity.INFO, options = {}) {
    const notification = {
      id: this.notificationId++,
      message: message,
      severity: severity,
      priority: options.priority || NotificationPriority.NORMAL,
      sticky: options.sticky || false,
      actions: options.actions || [],
      timeout: options.timeout || this.getDefaultTimeout(severity),
      source: options.source || 'System',
      timestamp: Date.now(),
      visible: true
    };

    this.notifications.push(notification);
    this.showNotification(notification);
    this.emit('notificationAdded', notification);

    // Auto-dismiss if not sticky
    if (!notification.sticky && notification.timeout > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.timeout);
    }

    return notification.id;
  }

  // Convenience methods
  info(message, options = {}) {
    return this.notify(message, NotificationSeverity.INFO, options);
  }

  warn(message, options = {}) {
    return this.notify(message, NotificationSeverity.WARNING, options);
  }

  error(message, options = {}) {
    return this.notify(message, NotificationSeverity.ERROR, {
      ...options,
      sticky: options.sticky !== false, // Default to sticky for errors
      timeout: options.timeout || 0
    });
  }

  success(message, options = {}) {
    return this.notify(message, NotificationSeverity.SUCCESS, options);
  }

  // Progress notifications
  progress(title, options = {}) {
    const progressNotification = {
      id: this.notificationId++,
      title: title,
      severity: NotificationSeverity.INFO,
      type: 'progress',
      progress: 0,
      total: options.total || 100,
      cancellable: options.cancellable || false,
      sticky: true,
      timestamp: Date.now(),
      visible: true
    };

    this.notifications.push(progressNotification);
    this.showProgressNotification(progressNotification);
    this.emit('notificationAdded', progressNotification);

    return {
      id: progressNotification.id,
      report: (increment) => this.updateProgress(progressNotification.id, increment),
      done: () => this.dismiss(progressNotification.id),
      cancel: () => this.dismiss(progressNotification.id)
    };
  }

  updateProgress(id, increment) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && notification.type === 'progress') {
      notification.progress = Math.min(notification.progress + increment, notification.total);
      this.updateProgressUI(notification);
      
      if (notification.progress >= notification.total) {
        setTimeout(() => this.dismiss(id), 1000);
      }
    }
  }

  // Notification management
  dismiss(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      notification.visible = false;
      this.hideNotification(notification);
      this.notifications.splice(index, 1);
      this.emit('notificationDismissed', notification);
    }
  }

  dismissAll() {
    const toRemove = [...this.notifications];
    toRemove.forEach(notification => {
      this.dismiss(notification.id);
    });
  }

  clear() {
    this.dismissAll();
  }

  // Getters
  getNotifications() {
    return [...this.notifications];
  }

  getNotification(id) {
    return this.notifications.find(n => n.id === id);
  }

  hasNotifications() {
    return this.notifications.length > 0;
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  // UI Management
  setupUI() {
    this.createToastContainer();
    this.createCenterContainer();
  }

  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'notification-toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      pointer-events: none;
    `;
    document.body.appendChild(this.toastContainer);
  }

  createCenterContainer() {
    this.centerContainer = document.createElement('div');
    this.centerContainer.className = 'notification-center-container';
    this.centerContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 20000;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      display: none;
    `;
    document.body.appendChild(this.centerContainer);
  }

  showNotification(notification) {
    if (notification.priority === NotificationPriority.URGENT) {
      this.showCenterNotification(notification);
    } else {
      this.showToastNotification(notification);
    }
  }

  showToastNotification(notification) {
    const element = this.createNotificationElement(notification);
    element.style.cssText += `
      margin-bottom: 10px;
      pointer-events: auto;
      animation: slideInRight 0.3s ease-out;
    `;

    this.toastContainer.appendChild(element);
    notification.element = element;

    // Add click handler to dismiss
    element.addEventListener('click', (e) => {
      if (e.target.closest('.notification-action')) return;
      this.dismiss(notification.id);
    });
  }

  showCenterNotification(notification) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 19999;
    `;

    const element = this.createNotificationElement(notification);
    element.style.cssText += `
      background: var(--vscode-notifications-background);
      border: 1px solid var(--vscode-notifications-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    this.centerContainer.appendChild(element);
    this.centerContainer.style.display = 'block';
    document.body.appendChild(overlay);

    notification.element = element;
    notification.overlay = overlay;

    // Close on overlay click
    overlay.addEventListener('click', () => {
      this.dismiss(notification.id);
    });
  }

  showProgressNotification(notification) {
    const element = this.createProgressElement(notification);
    this.toastContainer.appendChild(element);
    notification.element = element;
  }

  createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification notification-${notification.severity}`;
    element.style.cssText = `
      background: var(--vscode-notifications-background);
      border: 1px solid var(--vscode-notifications-border);
      border-left: 4px solid ${this.getSeverityColor(notification.severity)};
      border-radius: 4px;
      padding: 12px;
      color: var(--vscode-notifications-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 400px;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    `;

    const icon = document.createElement('span');
    icon.textContent = this.getSeverityIcon(notification.severity);
    icon.style.cssText = `
      font-size: 16px;
      margin-right: 8px;
      color: ${this.getSeverityColor(notification.severity)};
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: var(--vscode-notifications-foreground);
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 8px;
    `;
    closeButton.addEventListener('click', () => this.dismiss(notification.id));

    const message = document.createElement('div');
    message.textContent = notification.message;
    message.style.cssText = `
      line-height: 1.4;
      word-wrap: break-word;
    `;

    header.appendChild(icon);
    header.appendChild(closeButton);
    element.appendChild(header);
    element.appendChild(message);

    // Add actions if any
    if (notification.actions && notification.actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.style.cssText = `
        margin-top: 12px;
        display: flex;
        gap: 8px;
      `;

      notification.actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.label;
        button.className = 'notification-action';
        button.style.cssText = `
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 6px 12px;
          border-radius: 2px;
          cursor: pointer;
          font-size: 12px;
        `;
        button.addEventListener('click', () => {
          action.run();
          this.dismiss(notification.id);
        });
        actionsContainer.appendChild(button);
      });

      element.appendChild(actionsContainer);
    }

    return element;
  }

  createProgressElement(notification) {
    const element = document.createElement('div');
    element.className = 'notification notification-progress';
    element.style.cssText = `
      background: var(--vscode-notifications-background);
      border: 1px solid var(--vscode-notifications-border);
      border-radius: 4px;
      padding: 12px;
      color: var(--vscode-notifications-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      min-width: 300px;
      max-width: 400px;
      margin-bottom: 10px;
    `;

    const title = document.createElement('div');
    title.textContent = notification.title;
    title.style.cssText = `
      margin-bottom: 8px;
      font-weight: 500;
    `;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      width: 100%;
      height: 6px;
      background: var(--vscode-progressBar-background);
      border-radius: 3px;
      overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
      height: 100%;
      background: var(--vscode-progressBar-foreground);
      width: 0%;
      transition: width 0.3s ease;
    `;
    progressBar.appendChild(progressFill);

    element.appendChild(title);
    element.appendChild(progressBar);

    notification.progressBar = progressFill;

    return element;
  }

  updateProgressUI(notification) {
    if (notification.progressBar) {
      const percentage = (notification.progress / notification.total) * 100;
      notification.progressBar.style.width = `${percentage}%`;
    }
  }

  hideNotification(notification) {
    if (notification.element) {
      notification.element.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.element && notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
        if (notification.overlay && notification.overlay.parentNode) {
          notification.overlay.parentNode.removeChild(notification.overlay);
          this.centerContainer.style.display = 'none';
        }
      }, 300);
    }
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case NotificationSeverity.INFO: return 'ℹ️';
      case NotificationSeverity.WARNING: return '⚠️';
      case NotificationSeverity.ERROR: return '❌';
      case NotificationSeverity.SUCCESS: return '✅';
      default: return 'ℹ️';
    }
  }

  getSeverityColor(severity) {
    switch (severity) {
      case NotificationSeverity.INFO: return 'var(--vscode-notificationsInfoIcon-foreground)';
      case NotificationSeverity.WARNING: return 'var(--vscode-notificationsWarningIcon-foreground)';
      case NotificationSeverity.ERROR: return 'var(--vscode-notificationsErrorIcon-foreground)';
      case NotificationSeverity.SUCCESS: return '#4caf50';
      default: return 'var(--vscode-notificationsInfoIcon-foreground)';
    }
  }

  getDefaultTimeout(severity) {
    switch (severity) {
      case NotificationSeverity.INFO: return 4000;
      case NotificationSeverity.WARNING: return 6000;
      case NotificationSeverity.ERROR: return 0; // No timeout for errors
      case NotificationSeverity.SUCCESS: return 3000;
      default: return 4000;
    }
  }

  dispose() {
    this.dismissAll();
    
    if (this.toastContainer && this.toastContainer.parentNode) {
      this.toastContainer.parentNode.removeChild(this.toastContainer);
    }
    
    if (this.centerContainer && this.centerContainer.parentNode) {
      this.centerContainer.parentNode.removeChild(this.centerContainer);
    }

    super.dispose?.();
  }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .notification:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
  }

  .notification-action:hover {
    background: var(--vscode-button-hoverBackground) !important;
  }
`;
document.head.appendChild(style);
