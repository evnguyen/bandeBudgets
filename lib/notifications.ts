/** 
 * Notification dispatcher for triggering toasts from non-React contexts like Zustand stores
 */
let notificationCallback: ((message: string, type: 'error' | 'success') => void) | null = null;

export function setNotificationCallback(callback: (message: string, type: 'error' | 'success') => void) {
  notificationCallback = callback;
}

export function showNotification(message: string, type: 'error' | 'success' = 'error') {
  if (notificationCallback) {
    notificationCallback(message, type);
  } else {
    console.warn('Notification callback not set:', message, type);
  }
}

