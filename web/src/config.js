// web/src/config.js
export const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api/endpoints'
    : '/api/endpoints';
