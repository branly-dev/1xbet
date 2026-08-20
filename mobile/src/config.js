import { Platform } from 'react-native';

// In development:
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Physical Device: use your local IP address (e.g., 192.168.1.10)

const LOCAL_IP = '10.0.2.2'; // Change this to your local IP for physical device testing

export const API_URL = Platform.select({
  android: `http://${LOCAL_IP}:8000`,
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

console.log('API_URL:', API_URL);
