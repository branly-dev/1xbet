import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from './src/config';

const translations = {
  fr: {
    title: "Assistant Examens Cameroun",
    welcome: "Bonjour",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    login: "Se connecter",
    logout: "Déconnexion",
    chooseExam: "Choisir un examen",
    chooseSubject: "Choisir une matière",
    placeholder: "Posez votre question...",
    send: "Envoyer",
    thinking: "L'assistant réfléchit...",
    errorConn: "Erreur de connexion",
    moi: "Moi",
    assistant: "Assistant"
  },
  en: {
    title: "Cameroon Exam Assistant",
    welcome: "Hello",
    username: "Username",
    password: "Password",
    login: "Login",
    logout: "Logout",
    chooseExam: "Choose an exam",
    chooseSubject: "Choose a subject",
    placeholder: "Ask your question...",
    send: "Send",
    thinking: "Assistant is thinking...",
    errorConn: "Connection error",
    moi: "Me",
    assistant: "Assistant"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('fr');
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const t = translations[lang];

  useEffect(() => {
    loadUser();
    loadChatHistory();
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchSubjects(selectedExam);
    } else {
      setSubjects([]);
    }
  }, [selectedExam]);

  const loadUser = async () => {
    const savedUser = await AsyncStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const loadChatHistory = async () => {
    const history = await AsyncStorage.getItem('chat_history');
    if (history) setChatHistory(JSON.parse(history));
  };

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_URL}/exams.php`);
      const data = await response.json();
      setExams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (examId) => {
    try {
      const response = await fetch(`${API_URL}/subjects.php?exam_id=${examId}`);
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
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
      alert(t.errorConn);
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
        body: JSON.stringify({
            message,
            exam_id: selectedExam,
            subject_id: selectedSubject,
            language: lang
        }),
      });
      const data = await response.json();
      const updatedChat = [...newChat, { role: 'assistant', content: data.response }];
      setChatHistory(updatedChat);
      await AsyncStorage.setItem('chat_history', JSON.stringify(updatedChat));
    } catch (err) {
      alert(t.errorConn);
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr');

  if (!user) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleLang} style={styles.langToggle}>
          <Text style={styles.langText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.title}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.username}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder={t.password}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.buttonContainer}>
           <Button title={t.login} onPress={handleLogin} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t.welcome}, {user.username}</Text>
        <TouchableOpacity onPress={toggleLang} style={styles.langToggleSmall}>
          <Text style={styles.langTextSmall}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedExam}
          onValueChange={(itemValue) => setSelectedExam(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label={t.chooseExam} value="" />
          {exams.map(ex => <Picker.Item key={ex.id} label={ex.name} value={ex.id} />)}
        </Picker>

        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          style={styles.picker}
          enabled={!!selectedExam}
        >
          <Picker.Item label={t.chooseSubject} value="" />
          {subjects.map(sub => <Picker.Item key={sub.id} label={sub.name} value={sub.id} />)}
        </Picker>
      </View>

      <ScrollView style={styles.chatArea}>
        {chatHistory.map((chat, index) => (
          <View key={index} style={[styles.message, chat.role === 'user' ? styles.userMsg : styles.assistantMsg]}>
            <Text style={[styles.msgText, chat.role === 'user' ? styles.userMsgText : null]}>{chat.content}</Text>
          </View>
        ))}
        {loading && <Text style={styles.thinking}>{t.thinking}</Text>}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.chatInput}
          placeholder={t.placeholder}
          value={message}
          onChangeText={setMessage}
        />
        <Button title={t.send} onPress={handleSend} disabled={loading} />
      </View>
      <TouchableOpacity onPress={() => {setUser(null); AsyncStorage.removeItem('user');}}>
        <Text style={styles.logoutText}>{t.logout}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  langToggle: { alignSelf: 'flex-end', padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginBottom: 10 },
  langText: { fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#2c3e50' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  header: { fontSize: 20, fontWeight: '600' },
  langToggleSmall: { padding: 5, backgroundColor: '#eee', borderRadius: 3 },
  langTextSmall: { fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#bdc3c7', padding: 15, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff', fontSize: 18 },
  buttonContainer: { marginTop: 10, borderRadius: 8, overflow: 'hidden' },
  pickerContainer: { marginBottom: 15 },
  picker: { height: 50, width: '100%', backgroundColor: '#fff', marginBottom: 10 },
  chatArea: { flex: 1, marginBottom: 10 },
  message: { padding: 15, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
  userMsg: { backgroundColor: '#3498db', alignSelf: 'flex-end' },
  assistantMsg: { backgroundColor: '#ecf0f1', alignSelf: 'flex-start' },
  msgText: { fontSize: 18, color: '#2c3e50' },
  userMsgText: { color: '#fff' },
  thinking: { fontStyle: 'italic', color: '#7f8c8d', marginBottom: 10 },
  inputArea: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#bdc3c7', padding: 15, borderRadius: 8, marginRight: 10, backgroundColor: '#fff', fontSize: 18 },
  logoutText: { color: '#e74c3c', marginTop: 15, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }
});
