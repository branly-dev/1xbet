import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Login from './screens/Login';
import Chat from './screens/Chat';
import { translations } from './translations';

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('fr');
  const t = translations[lang];

  return (
    <View style={styles.container}>
      <View style={styles.langSwitcher}>
        <TouchableOpacity
          onPress={() => setLang('fr')}
          style={[styles.langButton, lang === 'fr' ? styles.langActive : styles.langInactive]}
        >
          <Text style={[styles.langText, lang === 'fr' ? styles.textActive : styles.textInactive]}>FR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLang('en')}
          style={[styles.langButton, lang === 'en' ? styles.langActive : styles.langInactive]}
        >
          <Text style={[styles.langText, lang === 'en' ? styles.textActive : styles.textInactive]}>EN</Text>
        </TouchableOpacity>
      </View>

      {!user ? (
        <Login onLogin={setUser} lang={lang} t={t} />
      ) : (
        <Chat user={user} lang={lang} t={t} onLogout={() => setUser(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  langSwitcher: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
    gap: 12,
  },
  langButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1E40AF',
    minWidth: 60,
    alignItems: 'center',
  },
  langActive: {
    backgroundColor: '#1E40AF',
  },
  langInactive: {
    backgroundColor: '#FFF',
  },
  langText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  textActive: {
    color: '#FFF',
  },
  textInactive: {
    color: '#1E40AF',
  },
});
