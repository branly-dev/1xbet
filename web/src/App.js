// web/src/App.js
import React, { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App" style={{ fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#0084ff', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1>Assistant Éducatif Camerounais</h1>
        <p>BAC • Probatoire • BEPC</p>
      </header>
      <main style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        {!user ? (
          <Login onLoginSuccess={handleLogin} />
        ) : (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <h2 style={{ textAlign: 'center' }}>Bienvenue, {user.username} !</h2>
            <Chat token={user.token} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
