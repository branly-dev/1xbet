import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ onNavigate }) {
  const exams = ['BAC', 'Probatoire', 'BEPC'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez votre examen</Text>
      {exams.map(exam => (
        <TouchableOpacity
          key={exam}
          style={styles.button}
          onPress={() => onNavigate('Chat')}
        >
          <Text style={styles.buttonText}>{exam}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, width: '100%' },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginBottom: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 }
});
