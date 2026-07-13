import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from './src/config';

const translations = {
    fr: {
        login: "Connexion",
        register: "S'inscrire",
        username: "Nom d'utilisateur",
        password: "Mot de passe",
        noAccount: "Pas de compte ?",
        haveAccount: "Déjà un compte ?",
        chatTitle: "Assistant d'Examen",
        selectExam: "Choisir un examen",
        selectSubject: "Choisir une matière",
        typeMessage: "Tapez votre question...",
        send: "Envoyer",
        logout: "Déconnexion"
    },
    en: {
        login: "Login",
        register: "Register",
        username: "Username",
        password: "Password",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        chatTitle: "Exam Assistant",
        selectExam: "Select an exam",
        selectSubject: "Select a subject",
        typeMessage: "Type your question...",
        send: "Send",
        logout: "Logout"
    }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('fr');
  const t = translations[language];

  if (!user) {
    return (
      <Auth onLogin={setUser} t={t} language={language} setLanguage={setLanguage} />
    );
  }

  return (
    <Chat user={user} setUser={setUser} t={t} language={language} setLanguage={setLanguage} />
  );
}

function Auth({ onLogin, t, language, setLanguage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username,
          password
        })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant Cameroun</Text>
        <TouchableOpacity onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')}>
          <Text style={styles.langBtn}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.authBox}>
        <Text style={styles.title}>{isLogin ? t.login : t.register}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{isLogin ? t.login : t.register}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>{isLogin ? t.noAccount : t.haveAccount}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Chat({ user, setUser, t, language, setLanguage }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/exams.php`)
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(err => console.error(err));
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    const newUserMsg = { role: 'user', content: message };
    setMessages([...messages, newUserMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message,
          exam_id: selectedExam,
          subject_id: selectedSubject,
          language
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentExam = exams.find(e => e.id == selectedExam);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.chatTitle}</Text>
        <TouchableOpacity onPress={() => setUser(null)}>
          <Text style={styles.logoutBtn}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickers}>
        <Picker
          selectedValue={selectedExam}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setSelectedExam(itemValue);
            setSelectedSubject('');
          }}
        >
          <Picker.Item label={t.selectExam} value="" />
          {exams.map(e => (
            <Picker.Item key={e.id} label={language === 'fr' ? e.name_fr : e.name_en} value={e.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedSubject}
          style={styles.picker}
          enabled={!!selectedExam}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
        >
          <Picker.Item label={t.selectSubject} value="" />
          {currentExam?.subjects.map(s => (
            <Picker.Item key={s.id} label={language === 'fr' ? s.name_fr : s.name_en} value={s.id} />
          ))}
        </Picker>
      </View>

      <ScrollView style={styles.messageList}>
        {messages.map((msg, i) => (
          <View key={i} style={[styles.msgItem, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text style={msg.role === 'user' ? styles.userMsgText : styles.aiMsgText}>{msg.content}</Text>
          </View>
        ))}
        {loading && <Text style={styles.loading}>...</Text>}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.chatInput}
          placeholder={t.typeMessage}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>{t.send}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: StatusBar.currentHeight
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb'
  },
  langBtn: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563'
  },
  logoutBtn: {
    color: '#ef4444',
    fontSize: 16
  },
  authBox: {
    padding: 20,
    marginTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  toggleText: {
    color: '#2563eb',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16
  },
  error: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center'
  },
  pickers: {
    flexDirection: 'row',
    padding: 5
  },
  picker: {
    flex: 1
  },
  messageList: {
    flex: 1,
    padding: 15
  },
  msgItem: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%'
  },
  userMsg: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end'
  },
  aiMsg: {
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start'
  },
  userMsgText: {
    color: '#fff',
    fontSize: 18
  },
  aiMsgText: {
    color: '#1f2937',
    fontSize: 18
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff'
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    marginRight: 10
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  loading: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 15
  }
});
