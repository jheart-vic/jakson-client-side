export const storage = {
  getToken : ()        => localStorage.getItem('token'),
  setToken : (t)       => localStorage.setItem('token', t),
  removeToken: ()      => localStorage.removeItem('token'),

  getUser  : ()        => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  },
  setUser  : (u)       => localStorage.setItem('user', JSON.stringify(u)),
  removeUser: ()       => localStorage.removeItem('user'),

  clear    : ()        => { localStorage.removeItem('token'); localStorage.removeItem('user') },
}
