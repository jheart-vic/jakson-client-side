import api from './axios'

export const getTeamStats    = ()            => api.get('/team/stats')
export const getTierMembers  = (tier, params)=> api.get(`/team/members/${tier}`, { params })
