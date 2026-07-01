import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <div className="container">
        <h1>Assistant Examens Cameroun</h1>
        {showRegister ? (
          <Register onRegister={() => setShowRegister(false)} onSwitch={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={handleLogin} onSwitch={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <span>Bonjour, {user.username}</span>
        <button onClick={handleLogout}>Déconnexion</button>
      </header>
      <Chat user={user} />
    </div>
  );
}

export default App;
