// mobile/src/config.js
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2. For iOS or real devices, use the machine IP.
export const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/endpoints'
    : 'http://localhost:8000/api/endpoints';
