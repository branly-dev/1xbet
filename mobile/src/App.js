import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Login from './screens/Login';
import Chat from './screens/Chat';

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('fr');

  return (
    <View style={styles.container}>
      {!user ? (
        <Login onLogin={setUser} lang={lang} />
      ) : (
        <Chat user={user} lang={lang} onLogout={() => setUser(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
});
