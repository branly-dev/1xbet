import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

export default function AuthScreen({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            await AsyncStorage.setItem('userToken', data.token);
            onLogin(data.user);
        } else {
            Alert.alert("Échec de connexion", data.error);
        }
    } catch (err) {
        Alert.alert("Erreur", "Serveur injoignable");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assistant Examens Cameroun</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.buttonContainer}>
        <Button title="Se connecter" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, width: '100%' },
  title: { fontSize: 24, marginBottom: 30, textAlign: 'center', fontWeight: 'bold' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10, fontSize: 16 },
  buttonContainer: { marginTop: 10 }
});
