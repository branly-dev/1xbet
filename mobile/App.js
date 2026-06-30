// mobile/App.js (React Native entry point)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './src/config';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem('chat_history');
      if (cached) setMessages(JSON.parse(cached));
      const savedToken = await AsyncStorage.getItem('user_token');
      if (savedToken) setToken(savedToken);
    } catch (e) {
      console.error("Failed to load cache", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, sender: 'user', timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    await AsyncStorage.setItem('chat_history', JSON.stringify(updatedMessages));

    try {
      const response = await axios.post(`${API_URL}/chat.php`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = { text: response.data.response, sender: 'ai', timestamp: new Date().toISOString() };
      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      await AsyncStorage.setItem('chat_history', JSON.stringify(finalMessages));
      setIsOffline(false);
    } catch (e) {
      console.log("Communication error", e);
      setIsOffline(true);
      Alert.alert("Mode Hors-ligne", "Impossible de contacter l'IA. Votre message est enregistré localement.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assistant Examens Cameroun</Text>
      {isOffline && <Text style={styles.offlineBanner}>Mode Hors-ligne</Text>}
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Révisons ensemble..."
        />
        <Button title="Envoyer" onPress={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, padding: 10, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  message: { padding: 10, marginVertical: 5, borderRadius: 10 },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  aiMsg: { alignSelf: 'flex-start', backgroundColor: '#ECECEC' },
  inputArea: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc', paddingVertical: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  offlineBanner: { backgroundColor: '#FFD700', textAlign: 'center', padding: 5 }
});
