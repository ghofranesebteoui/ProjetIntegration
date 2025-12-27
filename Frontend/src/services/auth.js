import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
    // ✅ Récupérer le token (priorité au token direct)
    let token = localStorage.getItem('token');
    
    // Fallback : chercher dans l'objet user
    if (!token) {
        const user = localStorage.getItem('user');
        if (user) {
            const parsed = JSON.parse(user);
            token = parsed.token;
        }
    }
    
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    
    return req;
});

export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    googleAuth: (code) => API.post('/auth/google', { code }),
    logout: () => API.post('/auth/logout'),
    dashboard: () => API.get('/dashboard'),
};