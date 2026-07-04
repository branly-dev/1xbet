import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import axios from 'axios';
import { API_URL } from './src/config';

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/exams.php`)
        .then(res => {
          setExams(res.data);
          if (res.data.length > 0) setSelectedExam(res.data[0].name);
        });
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth.php`, {
        action: 'login',
        username,
        password
      });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      alert('Erreur de connexion');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth.php`, {
        action: 'register',
        username,
        password
      });
      alert('Inscription réussie, connectez-vous.');
    } catch (err) {
      alert('Erreur d\'inscription');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: 'user' };
    setMessages([...messages, userMsg]);
    setInput('');

    try {
      const res = await axios.post(`${API_URL}/chat.php`, {
        message: input,
        exam_id: selectedExam,
        language: 'fr'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { text: res.data.response, sender: 'ai' }]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Assistant Examens CM</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.link}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat - {selectedExam}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text style={item.sender === 'user' ? styles.whiteText : styles.blackText}>{item.text}</Text>
          </View>
        )}
        style={styles.chatList}
      />
      <View style={styles.inputArea}>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.buttonText}>></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 10, fontSize: 18 },
  button: { width: '80%', padding: 15, backgroundColor: '#0084ff', borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  link: { marginTop: 15, color: '#0084ff' },
  header: { width: '100%', padding: 20, backgroundColor: '#0084ff', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  chatList: { flex: 1, width: '100%', padding: 10 },
  message: { padding: 15, borderRadius: 20, marginVertical: 5, maxWidth: '80%' },
  userMsg: { backgroundColor: '#0084ff', alignSelf: 'flex-end' },
  aiMsg: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start' },
  whiteText: { color: 'white' },
  blackText: { color: 'black' },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center' },
  chatInput: { flex: 1, padding: 10, fontSize: 18 },
  sendBtn: { padding: 15, backgroundColor: '#0084ff', borderRadius: 25, marginLeft: 10 }
});
