import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './src/config';

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
    loadChatHistory();
  }, []);

  const loadUser = async () => {
    const savedUser = await AsyncStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const loadChatHistory = async () => {
    const history = await AsyncStorage.getItem('chat_history');
    if (history) setChatHistory(JSON.parse(history));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        await AsyncStorage.setItem('user', JSON.stringify(data));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Erreur de connexion');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const newChat = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newChat);
    await AsyncStorage.setItem('chat_history', JSON.stringify(newChat));
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      const updatedChat = [...newChat, { role: 'assistant', content: data.response }];
      setChatHistory(updatedChat);
      await AsyncStorage.setItem('chat_history', JSON.stringify(updatedChat));
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Assistant Examens Cameroun</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Se connecter" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bonjour, {user.username}</Text>
      <ScrollView style={styles.chatArea}>
        {chatHistory.map((chat, index) => (
          <View key={index} style={[styles.message, chat.role === 'user' ? styles.userMsg : styles.assistantMsg]}>
            <Text style={styles.msgText}>{chat.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.chatInput}
          placeholder="Posez votre question..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Envoyer" onPress={handleSend} disabled={loading} />
      </View>
      <TouchableOpacity onPress={() => {setUser(null); AsyncStorage.removeItem('user');}}>
        <Text style={{color: 'red', marginTop: 10, textAlign: 'center'}}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  header: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  chatArea: { flex: 1, marginBottom: 10 },
  message: { padding: 10, borderRadius: 10, marginBottom: 5, maxWidth: '80%' },
  userMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  assistantMsg: { backgroundColor: '#ECECEC', alignSelf: 'flex-start' },
  msgText: { fontSize: 16 },
  inputArea: { flexDirection: 'row', alignItems: 'center' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginRight: 10 }
});
