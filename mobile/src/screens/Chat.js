import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function Chat({ user, t, isOffline, onQueueAction }) {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'other', text: "Bonjour, est-ce que le miel sauvage d Obala est pur ?" },
    { id: '2', sender: 'me', text: "Oui, pur à 100% récolté artisanalement." }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: String(messages.length + 1),
      sender: 'me',
      text: inputText
    };

    if (isOffline) {
      // Queue action for synchronization later under offline-first approach
      onQueueAction({ type: 'SEND_MESSAGE', data: newMsg });
      alert("Hors-ligne : Message ajouté à la file d'attente de synchronisation !");
    } else {
      setMessages([...messages, newMsg]);
    }
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.bubbleMe : styles.bubbleOther
          ]}>
            <Text style={[
              styles.messageText,
              item.sender === 'me' ? styles.textMe : styles.textOther
            ]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Écrire un message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>{t.send}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  messageList: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15, // Accessibility Standard Padding >= 15px
    borderRadius: 12,
    marginBottom: 10,
  },
  bubbleMe: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 18, // Accessibility Standard Min Font Size
  },
  textMe: {
    color: '#FFF',
  },
  textOther: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18, // Accessibility Standard Min Font Size
    color: '#111827',
    marginRight: 10,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 99,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
