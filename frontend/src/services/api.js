import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL;

export const submitFeedback = (data) => axios.post(`${API_BASE}/api/submit-feedback`, data);
export const getFeedbacks = () => axios.get(`${API_BASE}/feedbacks`);
export const getSummary = () => axios.get(`${API_BASE}/api/feedback-summary`);

const API_URL = import.meta.env.VITE_API_URL;

export const checkBackendStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking backend status:', error);
        throw error;
    }
}; 