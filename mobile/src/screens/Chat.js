import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../config';

const Chat = ({ user, lang, t, onLogout }) => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/endpoints/exams.php`)
      .then(res => res.json())
      .then(data => setExams(data));
  }, []);

  const handleSend = async () => {
    if (!message || !selectedExam || !selectedSubject) return;
    setLoading(true);
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
    setLoading(false);
  };

  const currentSubjects = exams.find(e => e.id == selectedExam)?.subjects || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.examAssistant}</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickers}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedExam}
            onValueChange={(itemValue) => setSelectedExam(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label={t.selectExam} value="" />
            {exams.map(e => <Picker.Item key={e.id} label={lang === 'fr' ? e.name_fr : e.name_en} value={e.id} />)}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => setSelectedSubject(itemValue)}
            style={styles.picker}
            enabled={!!selectedExam}
          >
            <Picker.Item label={t.selectSubject} value="" />
            {currentSubjects.map(s => <Picker.Item key={s.id} label={lang === 'fr' ? s.name_fr : s.name_en} value={s.id} />)}
          </Picker>
        </View>
      </View>

      <ScrollView style={styles.chatHistory}>
        {chatHistory.map((chat, i) => (
          <View key={i} style={styles.messageGroup}>
            <View style={styles.userBubble}><Text style={styles.userText}>{chat.message}</Text></View>
            <View style={styles.aiBubble}><Text style={styles.aiText}>{chat.response}</Text></View>
          </View>
        ))}
        {loading && <Text style={styles.loadingText}>{t.thinking}</Text>}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder={t.typeMessage}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>{t.send}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    elevation: 3
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E40AF' },
  logoutButton: { padding: 10 },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 18 },
  pickers: { padding: 15 },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden'
  },
  picker: { height: 60 },
  chatHistory: { flex: 1, padding: 15 },
  messageGroup: { marginBottom: 25 },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DBEAFE',
    padding: 15,
    borderRadius: 15,
    borderBottomRightRadius: 2,
    maxWidth: '85%',
    elevation: 1
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 15,
    borderBottomLeftRadius: 2,
    marginTop: 8,
    maxWidth: '85%',
    elevation: 1
  },
  userText: { fontSize: 18, color: '#1F2937' },
  aiText: { fontSize: 18, color: '#1F2937' },
  loadingText: { textAlign: 'center', fontStyle: 'italic', color: '#666', marginVertical: 15, fontSize: 16 },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 25,
    marginRight: 12,
    fontSize: 18,
    maxHeight: 120
  },
  sendButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    elevation: 2
  },
  sendButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});

export default Chat;
