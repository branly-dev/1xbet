import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import ChatScreen from './src/components/ChatScreen';
import { API_BASE, translations } from './src/config';

export default function App() {
  const [token, setToken] = useState(null);
  const [lang, setLang] = useState('fr');
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const t = translations[lang];

  const handleAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: view, username, password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const logout = () => {
    setToken(null);
    setView('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exam Assistant CM</Text>
        <View style={styles.langRow}>
          <TouchableOpacity onPress={() => setLang('fr')} style={lang === 'fr' ? styles.langActive : styles.langInactive}>
            <Text style={lang === 'fr' ? styles.langTextActive : styles.langTextInactive}>FR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLang('en')} style={lang === 'en' ? styles.langActive : styles.langInactive}>
            <Text style={lang === 'en' ? styles.langTextActive : styles.langTextInactive}>EN</Text>
          </TouchableOpacity>
        </View>
        {token && (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>{t.logout}</Text>
            </TouchableOpacity>
        )}
      </View>

      {!token ? (
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>{view === 'login' ? t.login : t.register}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.username}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={t.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.authBtn} onPress={handleAuth}>
            <Text style={styles.authBtnText}>{view === 'login' ? t.login : t.register}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView(view === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>
              {view === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ChatScreen token={token} lang={lang} onLogout={logout} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  langRow: { flexDirection: 'row', gap: 10 },
  langActive: { backgroundColor: '#2563eb', padding: 5, borderRadius: 5 },
  langInactive: { padding: 5 },
  langTextActive: { color: '#fff', fontWeight: 'bold' },
  langTextInactive: { color: '#2563eb' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 30 },
  authTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#1f2937' },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  authBtn: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  authBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { marginTop: 20, textAlign: 'center', color: '#2563eb', fontSize: 16 },
  logoutBtn: { backgroundColor: '#ef4444', padding: 8, borderRadius: 5 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
