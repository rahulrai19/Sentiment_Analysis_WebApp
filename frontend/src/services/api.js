import axios from 'axios';

// Update the API base URL to use the correct backend URL
const API_BASE = 'https://sentiment-s0y3.onrender.com';

export const submitFeedback = (data) => axios.post(`${API_BASE}/api/submit-feedback`, data);
export const getFeedbacks = () => axios.get(`${API_BASE}/feedbacks`);
export const getSummary = () => axios.get(`${API_BASE}/api/feedback-summary`);

export const checkBackendStatus = async () => {
    try {
        const response = await fetch(`${API_BASE}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking backend status:', error);
        throw error;
    }
};

export const getUniqueEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unique events:', error);
    throw error;
  }
}; 