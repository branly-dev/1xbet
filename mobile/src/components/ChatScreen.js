import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_BASE, translations } from '../config';

export default function ChatScreen({ token, lang, onLogout }) {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await fetch(`${API_BASE}/exams.php`);
            const data = await res.json();
            setExams(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !selectedExam || !selectedSubject) return;

        const userMsg = { role: 'user', content: input };
        setMessages([...messages, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/chat.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: input,
                    exam_id: selectedExam,
                    subject_id: selectedSubject,
                    language: lang
                })
            });
            const result = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: result.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Error' }]);
        } finally {
            setLoading(false);
        }
    };

    const currentExam = exams.find(e => e.id == selectedExam);

    return (
        <View style={styles.container}>
            <View style={styles.selectors}>
                <Picker
                    selectedValue={selectedExam}
                    onValueChange={(itemValue) => { setSelectedExam(itemValue); setSelectedSubject(''); }}
                    style={styles.picker}
                >
                    <Picker.Item label={t.selectExam} value="" />
                    {exams.map(e => (
                        <Picker.Item key={e.id} label={lang === 'fr' ? e.name_fr : e.name_en} value={e.id} />
                    ))}
                </Picker>

                <Picker
                    selectedValue={selectedSubject}
                    onValueChange={(itemValue) => setSelectedSubject(itemValue)}
                    enabled={!!selectedExam}
                    style={styles.picker}
                >
                    <Picker.Item label={t.selectSubject} value="" />
                    {currentExam?.subjects.map(s => (
                        <Picker.Item key={s.id} label={lang === 'fr' ? s.name_fr : s.name_en} value={s.id} />
                    ))}
                </Picker>
            </View>

            <ScrollView style={styles.chatArea}>
                {messages.map((m, i) => (
                    <View key={i} style={[styles.msgBox, m.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                        <Text style={m.role === 'user' ? styles.userText : styles.aiText}>{m.content}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder={t.typeMessage}
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                    <Text style={styles.sendBtnText}>{t.send}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    selectors: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    picker: { height: 50, width: '100%' },
    chatArea: { flex: 1, padding: 10 },
    msgBox: { padding: 15, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
    userMsg: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
    aiMsg: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6' },
    userText: { color: '#fff', fontSize: 16 },
    aiText: { color: '#1f2937', fontSize: 16 },
    inputArea: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    input: { flex: 1, height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, fontSize: 18 },
    sendBtn: { marginLeft: 10, backgroundColor: '#2563eb', borderRadius: 25, paddingHorizontal: 20, justifyContent: 'center' },
    sendBtnText: { color: '#fff', fontWeight: 'bold' }
});
