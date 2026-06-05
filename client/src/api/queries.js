import api from "./client";

export const fetchNodes = () => api.get("/nodes").then(r => r.data.data);
export const fetchRoutes = () => api.get("/routes").then(r => r.data.data);
export const fetchAlerts = () => api.get("/alerts").then(r => r.data.data);