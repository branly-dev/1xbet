import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
  Alert
} from 'react-native';
import API_URL from './src/config';

const translations = {
  fr: {
    title: "Assistant Examens",
    login: "Connexion",
    register: "S'inscrire",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    send: "Envoyer",
    welcome: "Bienvenue dans votre assistant de révision.",
    placeholder: "Posez votre question...",
    logout: "Quitter"
  },
  en: {
    title: "Exam Assistant",
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    send: "Send",
    welcome: "Welcome to your revision assistant.",
    placeholder: "Ask your question...",
    logout: "Logout"
  }
};

export default function App() {
  const [lang, setLang] = useState('fr');
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleAuth = async (action) => {
    try {
      const res = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (action === 'login') {
          setUser({ username, token: data.token });
          setView('chat');
        } else {
          Alert.alert("Success", "Account created, please login.");
          setView('login');
        }
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (err) {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    const msgToSend = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message: msgToSend,
          language: lang
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      Alert.alert("Error", "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'chat' && user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <TouchableOpacity onPress={() => setView('login')}>
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.chatArea} contentContainerStyle={{padding: 15}}>
          {messages.length === 0 && <Text style={styles.welcomeText}>{t.welcome}</Text>}
          {messages.map((m, i) => (
            <View key={i} style={[
              styles.bubble,
              m.role === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={m.role === 'user' ? styles.userText : styles.aiText}>{m.text}</Text>
            </View>
          ))}
          {loading && <Text style={styles.loadingText}>...</Text>}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={t.placeholder}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>{t.send}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.langSwitch}>
        <TouchableOpacity onPress={() => setLang('fr')} style={[styles.langBtn, lang === 'fr' && styles.activeLang]}>
          <Text>FR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLang('en')} style={[styles.langBtn, lang === 'en' && styles.activeLang]}>
          <Text>EN</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.authTitle}>{view === 'login' ? t.login : t.register}</Text>

      <TextInput
        style={styles.authInput}
        placeholder={t.username}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.authInput}
        placeholder={t.password}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.mainBtn} onPress={() => handleAuth(view)}>
        <Text style={styles.mainBtnText}>{view === 'login' ? t.login : t.register}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setView(view === 'login' ? 'register' : 'login')}>
        <Text style={styles.switchText}>
          {view === 'login' ? "No account? Register" : "Have an account? Login"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#fff', elevation: 2
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a365d' },
  logoutText: { color: '#e53e3e', fontWeight: 'bold' },
  chatArea: { flex: 1 },
  welcomeText: { textAlign: 'center', marginTop: 50, color: '#718096' },
  bubble: { padding: 15, borderRadius: 20, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: '#2b6cb0', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: '#edf2f7', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  userText: { color: '#fff' },
  aiText: { color: '#2d3748' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  input: { flex: 1, height: 45, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 22, paddingHorizontal: 15 },
  sendButton: { marginLeft: 10, backgroundColor: '#2b6cb0', borderRadius: 22, paddingHorizontal: 20, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  loadingText: { fontStyle: 'italic', color: '#a0aec0', marginLeft: 15 },
  authContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  langSwitch: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  langBtn: { padding: 8, marginHorizontal: 5, borderRadius: 5, backgroundColor: '#f7fafc' },
  activeLang: { backgroundColor: '#ebf8ff', borderColor: '#3182ce', borderWidth: 1 },
  authTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2a4365' },
  authInput: { height: 55, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15 },
  mainBtn: { backgroundColor: '#2b6cb0', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { textAlign: 'center', marginTop: 20, color: '#4a5568' }
});
