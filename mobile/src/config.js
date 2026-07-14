// mobile/src/config.js
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/endpoints'
    : 'http://localhost:8000/api/endpoints';

export default API_URL;
