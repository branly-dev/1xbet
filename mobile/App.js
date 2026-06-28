import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { saveChatLocally, getOfflineChats } from './src/storage';

const API_BASE = 'http://localhost:8000/api/endpoints'; // Adjust for real device to server IP

export default function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    async function load() {
        const offline = await getOfflineChats();
        setChatLog(offline);
    }
    load();
  }, []);

  const handleLogin = async () => {
    try {
        const resp = await fetch(`${API_BASE}/auth/login.php`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (data.token) {
            setToken(data.token);
        } else {
            Alert.alert('Erreur', data.error || 'Connexion échouée');
        }
    } catch (e) {
        Alert.alert('Erreur réseau', 'Impossible de contacter le serveur');
    }
  };

  const sendMessage = async () => {
    if (!message) return;

    const newChat = { role: 'user', text: message };
    setChatLog(prev => [...prev, newChat]);
    await saveChatLocally(newChat);
    setMessage('');

    if (token) {
        try {
            const resp = await fetch(`${API_BASE}/assistant/chat.php`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ message })
            });
            const data = await resp.json();
            const aiMsg = { role: 'ai', text: data.response };
            setChatLog(prev => [...prev, aiMsg]);
            await saveChatLocally(aiMsg);
        } catch (e) {
            // Offline fallback
            const fallback = { role: 'ai', text: "Erreur réseau. Mode hors-ligne activé." };
            setChatLog(prev => [...prev, fallback]);
        }
    } else {
        const aiResp = { role: 'ai', text: "Veuillez vous connecter pour parler à l'IA en ligne." };
        setChatLog(prev => [...prev, aiResp]);
        await saveChatLocally(aiResp);
    }
  };

  if (!token) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion (Assistant IA)</Text>
            <TextInput style={styles.input} placeholder="Nom d'utilisateur" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title="Se connecter" onPress={handleLogin} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assistant Examens</Text>
      <ScrollView style={styles.chatBox}>
        {chatLog.map((m, i) => (
          <Text key={i} style={m.role === 'user' ? styles.userMsg : styles.aiMsg}>
            {m.role === 'user' ? 'Moi: ' : 'IA: '}{m.text}
          </Text>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Posez votre question..."
      />
      <Button title="Envoyer" onPress={sendMessage} />
      <View style={{marginTop: 10}}>
          <Button title="Déconnexion" color="#666" onPress={() => setToken(null)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  chatBox: { flex: 1, marginBottom: 20 },
  userMsg: { textAlign: 'right', backgroundColor: '#e3f2fd', padding: 10, marginVertical: 5 },
  aiMsg: { textAlign: 'left', backgroundColor: '#f1f8e9', padding: 10, marginVertical: 5 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 }
});
