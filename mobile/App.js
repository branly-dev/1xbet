import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from './src/config';

export default function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [exam, setExam] = useState('BAC');
  const [subject, setSubject] = useState('Mathématiques');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
      } else {
        alert(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = { role: 'user', content: message };
    setChatHistory([...chatHistory, userMsg]);
    const currentMsg = message;
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentMsg, exam, subject }),
      });
      const data = await response.json();
      if (response.ok) {
        setChatHistory(prev => [...prev, { role: 'bot', content: data.response }]);
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  if (!token) {
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.chatContainer}>
        <View style={styles.selectors}>
          <Picker
            selectedValue={exam}
            style={styles.picker}
            onValueChange={(itemValue) => setExam(itemValue)}>
            <Picker.Item label="BAC" value="BAC" />
            <Picker.Item label="Probatoire" value="Probatoire" />
            <Picker.Item label="BEPC" value="BEPC" />
          </Picker>
          <Picker
            selectedValue={subject}
            style={styles.picker}
            onValueChange={(itemValue) => setSubject(itemValue)}>
            <Picker.Item label="Mathématiques" value="Mathématiques" />
            <Picker.Item label="Physique" value="Physique" />
            <Picker.Item label="Français" value="Français" />
          </Picker>
        </View>
        <ScrollView style={styles.history}>
          {chatHistory.map((msg, i) => (
            <View key={i} style={[styles.msgBox, msg.role === 'user' ? styles.userMsg : styles.botMsg]}>
              <Text>{msg.content}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.chatInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Posez votre question..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1a73e8' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#1a73e8', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  chatContainer: { flex: 1, padding: 10 },
  selectors: { flexDirection: 'row', marginBottom: 10 },
  picker: { flex: 1, height: 50 },
  history: { flex: 1 },
  msgBox: { padding: 10, borderRadius: 10, marginBottom: 10, maxWidth: '80%' },
  userMsg: { backgroundColor: '#e3f2fd', alignSelf: 'flex-end' },
  botMsg: { backgroundColor: '#f1f0f0', alignSelf: 'flex-start' },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  chatInput: { flex: 1, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginRight: 10 },
  sendButton: { backgroundColor: '#1a73e8', padding: 10, borderRadius: 5, justifyContent: 'center' }
});
