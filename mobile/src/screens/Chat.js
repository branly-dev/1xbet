import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../config';

const Chat = ({ user, lang, onLogout }) => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/endpoints/exams.php`)
      .then(res => res.json())
      .then(data => setExams(data));
  }, []);

  const handleSend = async () => {
    if (!message || !selectedExam || !selectedSubject) return;
    try {
      const response = await fetch(`${API_URL}/api/endpoints/chat.php`, {
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
        })
      });
      const data = await response.json();
      setChatHistory([...chatHistory, { message, response: data.response }]);
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const currentSubjects = exams.find(e => e.id == selectedExam)?.subjects || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant Examen</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickers}>
        <Picker
          selectedValue={selectedExam}
          onValueChange={(itemValue) => setSelectedExam(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Choisir un examen" value="" />
          {exams.map(e => <Picker.Item key={e.id} label={lang === 'fr' ? e.name_fr : e.name_en} value={e.id} />)}
        </Picker>

        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          style={styles.picker}
          enabled={!!selectedExam}
        >
          <Picker.Item label="Choisir une matière" value="" />
          {currentSubjects.map(s => <Picker.Item key={s.id} label={lang === 'fr' ? s.name_fr : s.name_en} value={s.id} />)}
        </Picker>
      </View>

      <ScrollView style={styles.chatHistory}>
        {chatHistory.map((chat, i) => (
          <View key={i} style={styles.messageGroup}>
            <View style={styles.userBubble}><Text style={styles.userText}>{chat.message}</Text></View>
            <View style={styles.aiBubble}><Text style={styles.aiText}>{chat.response}</Text></View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre question..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF' },
  logoutText: { color: '#EF4444' },
  pickers: { padding: 10 },
  picker: { backgroundColor: '#FFF', marginBottom: 10 },
  chatHistory: { flex: 1, padding: 15 },
  messageGroup: { marginBottom: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#DBEAFE', padding: 10, borderRadius: 10, maxWidth: '80%' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 10, marginTop: 5, maxWidth: '80%' },
  userText: { fontSize: 16 },
  aiText: { fontSize: 16 },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF' },
  input: { flex: 1, backgroundColor: '#F3F4F6', padding: 10, borderRadius: 20, marginRight: 10 },
  sendButton: { backgroundColor: '#1E40AF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, justifyContent: 'center' },
  sendButtonText: { color: '#FFF', fontWeight: 'bold' },
});

export default Chat;
