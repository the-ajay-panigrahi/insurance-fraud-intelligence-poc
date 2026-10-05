import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export const claimsAPI = {
  getDashboard: async () => {
    const res = await api.get("/dashboard");
    return res.data;
  },
  getClaim: async (claimId) => {
    const res = await api.get(`/claims/${claimId}`);
    return res.data;
  },
  getRelationships: async (claimId) => {
    const res = await api.get(`/claims/${claimId}/relationships`);
    return res.data;
  },
};

export const investigationAPI = {
  update: async (claimId, payload) => {
    const res = await api.patch(`/investigations/${claimId}`, payload);
    return res.data;
  },
};

export default api;
