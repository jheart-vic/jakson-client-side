import api from './axios';

export const getNotifications = (params, config = {}) => {
  return api.get('/notifications', { params, ...config })
}
export const getUnreadCount         = ()        => api.get('/notifications/unread-count');
export const markAsRead             = (id)      => api.put(`/notifications/${id}/read`);
export const markAllAsRead          = ()        => api.put('/notifications/read-all');
export const deleteNotification     = (id)      => api.delete(`/notifications/${id}`);
export const deleteAllNotifications = ()        => api.delete('/notifications/all');