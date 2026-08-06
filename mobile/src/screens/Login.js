import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../config';

const Login = ({ onLogin, lang, t }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    const action = isRegister ? 'register' : 'login';
    try {
      const response = await fetch(`${API_URL}/api/endpoints/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (isRegister) {
          setIsRegister(false);
          Alert.alert(t.success, t.registered);
        } else {
          onLogin(data);
        }
      } else {
        Alert.alert(t.error, data.error);
      }
    } catch (err) {
      Alert.alert(t.error, t.connectionFailed);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? t.register : t.login}</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isRegister ? t.register : t.login}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={styles.linkContainer}>
        <Text style={styles.link}>
          {isRegister ? t.alreadyHaveAccount : t.dontHaveAccount}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#1E40AF' },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  button: {
    backgroundColor: '#1E40AF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 25, padding: 10 },
  link: { textAlign: 'center', color: '#1E40AF', fontSize: 18, fontWeight: '500' },
});

export default Login;
