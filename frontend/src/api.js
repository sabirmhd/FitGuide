import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = (data) => api.post('login/', data);
export const register = (data) => api.post('register/', data);
export const logout = () => api.post('logout/');

export const getProfile = () => api.get('update-profile/');
export const updateProfile = (data) => api.post('update-profile/', data);
export const searchFood = (query) => api.post('search-food/', { query });
export const logFood = (foodData) => api.post('log-food/', foodData);
export const getDashboardSummary = () => api.get('dashboard-summary/');
export const getWeeklyStats = () => api.get('stats/weekly/');
export const getWaterIntake = () => api.get('water/');
export const logWater = (amount) => api.post('water/', { amount_ml: amount });
export const getWeightLogs = () => api.get('weight/');
export const logWeight = (weight) => api.post('weight/', { weight_kg: weight });
export const getExercises = () => api.get('activity/');
export const logExercise = (data) => api.post('activity/', data);
export const getDietSuggestions = () => api.get('diet-suggestions/');
export const getMonthlyStats = () => api.get('stats/monthly/');
export const getSleepLogs = () => api.get('sleep/');
export const logSleep = (data) => api.post('sleep/', data);
export const downloadMonthlyReport = () => api.get('monthly-report-pdf/', { responseType: 'blob' });

export const deleteFoodLog = (id) => api.delete(`log-food/${id}/`);
export const deleteWaterLog = (id) => api.delete(`water/${id}/`);
export const deleteWeightLog = (id) => api.delete(`weight/${id}/`);
export const deleteExerciseLog = (id) => api.delete(`activity/${id}/`);
export const deleteSleepLog = (id) => api.delete(`sleep/${id}/`);


export const requestPasswordReset = (email) => api.post('password-reset/', { email });
export const confirmPasswordReset = (data) => api.post('password-reset-confirm/', data);

export default api;
