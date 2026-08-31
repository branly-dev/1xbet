import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from './src/config';

export default function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [language, setLanguage] = useState('fr');

  const translations = {
    fr: { title: "Assistant d'Examen", login: "Se connecter", send: "Envoyer", toggle: "English", exam: "Sélectionner Examen", subject: "Sélectionner Matière" },
    en: { title: "Exam Assistant", login: "Login", send: "Send", toggle: "Français", exam: "Select Exam", subject: "Select Subject" }
  };
  const t = translations[language];

  useEffect(() => {
    fetch(`${API_URL}/exams.php`)
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(err => console.error(err));
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.token) setToken(data.token);
      else alert(data.error);
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleSend = async () => {
    if (!message) return;
    try {
      const res = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          exam_id: selectedExam,
          subject_id: selectedSubject,
          language: language
        })
      });
      const data = await res.json();
      setChatLog([...chatLog, { user: message, bot: data.response }]);
      setMessage('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t.login}</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t.login}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')} style={styles.toggle}>
        <Text style={{fontSize: 16}}>{t.toggle}</Text>
      </TouchableOpacity>
      <Text style={styles.header}>{t.title}</Text>
      <Picker
        selectedValue={selectedExam}
        onValueChange={(itemValue) => setSelectedExam(itemValue)}
        style={styles.picker}>
        <Picker.Item label={t.exam} value={null} />
        {exams.map(e => <Picker.Item key={e.id} label={e.name} value={e.id} />)}
      </Picker>
      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue) => setSelectedSubject(itemValue)}
        style={styles.picker}>
        <Picker.Item label={t.subject} value={null} />
        {exams.find(e => e.id == selectedExam)?.subjects.map(s => (
          <Picker.Item key={s.id} label={s.name} value={s.id} />
        ))}
      </Picker>
      <ScrollView style={styles.chatBox}>
        {chatLog.map((chat, i) => (
          <View key={i} style={styles.chatEntry}>
            <Text style={styles.chatText}><Text style={{fontWeight: 'bold'}}>{language === 'fr' ? 'Vous' : 'You'}:</Text> {chat.user}</Text>
            <Text style={styles.chatText}><Text style={{fontWeight: 'bold'}}>IA:</Text> {chat.bot}</Text>
          </View>
        ))}
      </ScrollView>
      <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder={t.send + "..."} />
      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>{t.send}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 15, fontSize: 18 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatBox: { flex: 1, marginVertical: 20 },
  chatEntry: { marginBottom: 15 },
  chatText: { fontSize: 18 },
  picker: { height: 50, width: '100%', marginBottom: 10 },
  toggle: { alignSelf: 'flex-end', padding: 10 }
});
