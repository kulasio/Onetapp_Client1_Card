// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://onetapp-backend.onrender.com';

export const API_ENDPOINTS = {
  // Card endpoints
  GET_CARD: (cardUid) => `${API_BASE_URL}/api/cards/dynamic/${cardUid}`,
  
  // Tap analytics endpoints (for future use)
  LOG_TAP: `${API_BASE_URL}/api/taps`,
  GET_ANALYTICS: (cardId) => `${API_BASE_URL}/api/analytics/card/${cardId}`,
  GET_EVENT_ANALYTICS: (eventId) => `${API_BASE_URL}/api/analytics/event/${eventId}`,
};

export default API_BASE_URL; 