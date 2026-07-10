import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from './src/config';

export default function App() {
  const [token, setToken] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [language, setLanguage] = useState('fr');

  const translations = {
    fr: { login: "Connexion", register: "S'inscrire", welcome: "Assistant Examens", send: "Envoyer", user: "Vous", ai: "Assistant" },
    en: { login: "Login", register: "Register", welcome: "Exam Assistant", send: "Send", user: "You", ai: "Assistant" }
  };
  const t = translations[language];

  useEffect(() => {
    fetch(`${API_URL}/exams.php`)
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(e => console.log(e));
  }, []);

  const handleAuth = async () => {
    const action = isLogin ? 'login' : 'register';
    try {
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) setToken(data.token);
        else {
          setIsLogin(true);
          alert('Registered!');
        }
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleSend = async () => {
    if (!message) return;
    setChat([...chat, { role: 'user', text: message }]);
    try {
      const response = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, exam_id: selectedExam, subject_id: selectedSubject, language }),
      });
      const data = await response.json();
      setChat(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (e) {
      alert('Error sending message');
    }
    setMessage('');
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{isLogin ? t.login : t.register}</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isLogin ? t.login : t.register}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text>{isLogin ? "No account? Register" : "Have account? Login"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t.welcome}</Text>
        <TouchableOpacity onPress={() => setToken(null)}><Text>Logout</Text></TouchableOpacity>
      </View>
      <View style={styles.langSwitcher}>
        <TouchableOpacity onPress={() => setLanguage('fr')}><Text style={language === 'fr' ? styles.langActive : styles.langInactive}>FR</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguage('en')}><Text style={language === 'en' ? styles.langActive : styles.langInactive}>EN</Text></TouchableOpacity>
      </View>
      <View style={styles.selectors}>
        <Picker
          selectedValue={selectedExam}
          onValueChange={(itemValue) => {
            setSelectedExam(itemValue);
            const exam = exams.find(e => e.id == itemValue);
            setSubjects(exam ? exam.subjects : []);
            setSelectedSubject('');
          }}>
          <Picker.Item label={language === 'fr' ? "Choisir un examen" : "Select Exam"} value="" />
          {exams.map(e => <Picker.Item key={e.id} label={e.name} value={e.id} />)}
        </Picker>
        {selectedExam ? (
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => setSelectedSubject(itemValue)}>
            <Picker.Item label={language === 'fr' ? "Choisir une matière" : "Select Subject"} value="" />
            {subjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
          </Picker>
        ) : null}
      </View>
      <ScrollView style={styles.chat}>
        {chat.map((m, i) => (
          <View key={i} style={[styles.msg, m.role === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text style={m.role === 'user' ? styles.userText : styles.aiText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput style={styles.chatInput} value={message} onChangeText={setMessage} placeholder="Type here..." />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.buttonText}>{t.send}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  safe: { flex: 1, backgroundColor: '#fff' },
  langSwitcher: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 15, paddingTop: 10 },
  langActive: { fontWeight: 'bold', color: '#007bff', marginLeft: 10 },
  langInactive: { color: '#ccc', marginLeft: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 18 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  chat: { flex: 1, padding: 10 },
  msg: { padding: 10, borderRadius: 10, marginBottom: 10, maxWidth: '80%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#007bff' },
  aiMsg: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0' },
  userText: { color: '#fff' },
  aiText: { color: '#000' },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  sendBtn: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center' }
});
