import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/endpoints';

export default function App() {
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedMessages = await AsyncStorage.getItem('messages');
      if (savedToken) setToken(savedToken);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login.php`, { username, password });
      const jwt = res.data.jwt;
      setToken(jwt);
      await AsyncStorage.setItem('token', jwt);
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/register.php`, { username, password });
      alert("Compte créé ! Connectez-vous.");
      setIsRegistering(false);
    } catch (err) {
      alert("Erreur lors de l'inscription");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { text: input, isAi: false, id: Date.now().toString() };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
    try {
      const res = await axios.post(`${API_URL}/chat.php`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aiResponse = { text: res.data.response, isAi: true, id: (Date.now() + 1).toString() };
      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      await AsyncStorage.setItem('messages', JSON.stringify(finalMessages));
    } catch (err) {
      const errorMsg = { text: "Désolé, je ne peux pas répondre pour le moment. (Mode Hors-ligne)", isAi: true, id: (Date.now() + 1).toString() };
      setMessages([...updatedMessages, errorMsg]);
    }
  };

  if (!token) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Assistant Examens CM</Text>
        <TextInput style={styles.input} placeholder="Utilisateur" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={isRegistering ? handleRegister : handleLogin}>
          <Text style={styles.buttonText}>{isRegistering ? "S'INSCRIRE" : "SE CONNECTER"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{marginTop: 20}} onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={{textAlign: 'center', color: '#0056b3'}}>
            {isRegistering ? "Déjà un compte ? Connexion" : "Pas de compte ? S'inscrire"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Mon Assistant IA</Text></View>
      <ScrollView style={styles.chatArea}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.msgBox, m.isAi ? styles.aiMsg : styles.userMsg]}>
            <Text style={m.isAi ? styles.aiText : styles.userText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputArea}>
          <TextInput style={styles.chatInput} placeholder="Pose ta question..." value={input} onChangeText={setInput} />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}><Text style={styles.sendBtnText}>OK</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0056b3', textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#0056b3', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  header: { backgroundColor: '#0056b3', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  chatArea: { flex: 1, padding: 15 },
  msgBox: { padding: 15, borderRadius: 15, marginBottom: 10, maxWidth: '85%' },
  aiMsg: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start' },
  userMsg: { backgroundColor: '#0056b3', alignSelf: 'flex-end' },
  aiText: { color: '#000' },
  userText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 },
  sendBtn: { backgroundColor: '#00a884', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' }
});
