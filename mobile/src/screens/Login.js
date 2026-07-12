import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../config';

const Login = ({ onLogin, lang }) => {
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
          Alert.alert("Success", "Registered successfully");
        } else {
          onLogin(data);
        }
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (err) {
      Alert.alert("Error", "Connection failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? "S'inscrire" : "Connexion"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isRegister ? "S'inscrire" : "Connexion"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.link}>
          {isRegister ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1E40AF' },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 18 },
  button: { backgroundColor: '#1E40AF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#1E40AF', fontSize: 16 },
});

export default Login;
