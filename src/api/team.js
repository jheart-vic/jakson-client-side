import api from './axios'

export const getTeamStats    = ()            => api.get('/team/stats')
export const getTierMembers = (tier, page = 1, limit = 50) =>
    api.get(`/team/members/${tier}?page=${page}&limit=${limit}`)
// export const getTierMembers  = (tier, params)=> api.get(`/team/members/${tier}`, { params })
