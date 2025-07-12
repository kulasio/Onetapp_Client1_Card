import { API_ENDPOINTS } from '../config/api';

// Helper: Get cardUid from URL parameters (accepts both cardUid and cardUID)
export const getCardUidParam = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('cardUid') || urlParams.get('cardUID');
};

// Helper: Get any query parameter by name
export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Convert Buffer to base64 string (for profile images)
export const bufferToBase64 = (bufferObj) => {
  if (!bufferObj || !bufferObj.data) return '';
  if (typeof bufferObj.data === 'string') {
    // Already a base64 string
    return bufferObj.data;
  }
  if (Array.isArray(bufferObj.data)) {
    // Buffer object with .data array
    return btoa(String.fromCharCode(...bufferObj.data));
  }
  return '';
};

// Fetch card data from backend
export const fetchCardData = async (cardUid) => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_CARD(cardUid));
    if (!response.ok) {
      throw new Error('Card not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching card data:', error);
    throw error;
  }
};

// Log tap analytics
export const logTap = async (tapData) => {
  try {
    const response = await fetch(API_ENDPOINTS.LOG_TAP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tapData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to log tap');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging tap:', error);
    // Don't throw error to avoid breaking user experience
  }
};

// Log user actions (link clicks, media plays, etc.)
export const logUserAction = async (cardId, actionData) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.LOG_TAP}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId,
        ...actionData,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to log user action');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging user action:', error);
    // Don't throw error to avoid breaking user experience
  }
}; 