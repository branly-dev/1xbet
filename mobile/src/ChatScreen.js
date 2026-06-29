import React from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

export default function ChatScreen({ onBack, exam }) {
  const [message, setMessage] = React.useState('');
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleSend = async () => {
    if (!message) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, exam })
      });

      const data = await response.json();
      if (response.ok) {
        setHistory([...history, { user: message, bot: data.response }]);
      } else {
        Alert.alert("Erreur", data.error || "Une erreur est survenue");
        // Si le token est expiré, on pourrait rediriger vers la connexion
      }
    } catch (err) {
      // Mode Hors-ligne
      const mockResponse = "[Hors-ligne] Désolé, je ne peux pas me connecter au serveur. Vérifiez votre connexion.";
      setHistory([...history, { user: message, bot: mockResponse }]);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Retour" onPress={onBack} />
      <Text style={styles.header}>Assistant - {exam}</Text>
      <ScrollView style={styles.chatArea}>
        {history.map((item, index) => (
          <View key={index} style={styles.msgContainer}>
            <Text style={styles.userText}>Vous: {item.user}</Text>
            <Text style={styles.botText}>IA: {item.bot}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Posez votre question..."
          value={message}
          onChangeText={setMessage}
          editable={!loading}
        />
        <Button title={loading ? "..." : "Envoyer"} onPress={handleSend} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, width: '100%', marginTop: 40 },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  chatArea: { flex: 1, marginVertical: 10 },
  msgContainer: { marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  userText: { fontWeight: 'bold' },
  botText: { color: '#007AFF', marginTop: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10, padding: 8 }
});
