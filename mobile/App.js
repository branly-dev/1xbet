import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AuthScreen from './src/AuthScreen';
import HomeScreen from './src/HomeScreen';
import ChatScreen from './src/ChatScreen';

export default function App() {
  const [user, setUser] = React.useState(null);
  const [currentScreen, setCurrentScreen] = React.useState('Auth');
  const [selectedExam, setSelectedExam] = React.useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('Home');
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setCurrentScreen('Chat');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'Auth' && <AuthScreen onLogin={handleLogin} />}
      {currentScreen === 'Home' && <HomeScreen onNavigate={handleSelectExam} />}
      {currentScreen === 'Chat' && <ChatScreen onBack={() => setCurrentScreen('Home')} exam={selectedExam} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
