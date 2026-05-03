import { api } from "./client";

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  updateMe: (payload) => api.patch("/auth/me", payload)
};

export const groupsApi = {
  list: () => api.get("/groups"),
  get: (id) => api.get(`/groups/${id}`),
  create: (payload) => api.post("/groups", payload),
  update: (id, payload) => api.patch(`/groups/${id}`, payload),
  remove: (id) => api.delete(`/groups/${id}`),
  updateMembers: (id, payload) => api.patch(`/groups/${id}/members`, payload),
  balances: (id) => api.get(`/groups/${id}/balances`)
};

export const expensesApi = {
  list: (groupId) => api.get(`/groups/${groupId}/expenses`),
  get: (id) => api.get(`/expenses/${id}`),
  create: (groupId, payload) => api.post(`/groups/${groupId}/expenses`, payload),
  update: (id, payload) => api.patch(`/expenses/${id}`, payload),
  remove: (id) => api.delete(`/expenses/${id}`),
  settle: (id) => api.patch(`/expenses/${id}/settle`)
};
