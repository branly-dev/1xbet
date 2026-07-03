import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

const translations = {
  fr: {
    title: "Assistant Examens Cameroun",
    welcome: "Bonjour",
    logout: "Déconnexion",
    connexion: "Connexion",
    inscription: "S'inscrire",
    switchLogin: "Déjà un compte ? Se connecter",
    switchRegister: "Pas de compte ? S'inscrire"
  },
  en: {
    title: "Cameroon Exam Assistant",
    welcome: "Hello",
    logout: "Logout",
    connexion: "Login",
    inscription: "Register",
    switchLogin: "Already have an account? Login",
    switchRegister: "Don't have an account? Register"
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedLang = localStorage.getItem('lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = translations[lang];

  if (!user) {
    return (
      <div className="container">
        <div className="lang-switcher">
          <button onClick={toggleLang}>{lang.toUpperCase()}</button>
        </div>
        <h1>{t.title}</h1>
        {showRegister ? (
          <Register
            onRegister={() => setShowRegister(false)}
            onSwitch={() => setShowRegister(false)}
            lang={lang}
            t={t}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onSwitch={() => setShowRegister(true)}
            lang={lang}
            t={t}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <div className="header-left">
          <span>{t.welcome}, {user.username}</span>
        </div>
        <div className="header-right">
           <button onClick={toggleLang} style={{marginRight: '10px'}}>{lang.toUpperCase()}</button>
           <button onClick={handleLogout}>{t.logout}</button>
        </div>
      </header>
      <Chat user={user} lang={lang} />
    </div>
  );
}

export default App;
