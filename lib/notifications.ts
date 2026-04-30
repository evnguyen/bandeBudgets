import type { NotificationCallback, NotificationType } from '@/lib/types'

let notificationCallback: NotificationCallback | null = null

export const setNotificationCallback = (callback: NotificationCallback) => {
	notificationCallback = callback
}

export const showNotification = (message: string, type: NotificationType = 'error') => {
	if (notificationCallback) {
		notificationCallback(message, type)
	} else if (process.env.NODE_ENV !== 'production') {
		console.warn('Notification callback not set:', message, type)
	}
}
