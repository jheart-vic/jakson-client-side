import api from './axios';

export const getPublicSettings      = ()  => api.get('/settings/public');

// All notifications — used by the Notifications page (includes bonus codes)
export const getPublicNotifications = ()  => api.get('/settings/notifications');

// Announcements only — excludes bonus-code type, used by Dashboard feed
export const getAnnouncements       = ()  => api.get('/settings/notifications?exclude=bonus');