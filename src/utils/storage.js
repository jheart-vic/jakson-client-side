// Token is now an HTTP-only cookie managed entirely by the server.
// We only cache the user object in localStorage for instant UI rendering.

export const storage = {
  getUser:    () => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  },
  setUser:    (u) => localStorage.setItem('user', JSON.stringify(u)),
  removeUser: () => localStorage.removeItem('user'),

  // Legacy clear — also removes any old token key that may still exist
  clear: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')   // clean up old sessions
  },
}