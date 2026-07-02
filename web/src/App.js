import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (token, username) => {
    setUser({ token, username });
  };

  if (user) {
    return <Chat token={user.token} username={user.username} />;
  }

  return isRegistering ? (
    <Register onSwitch={() => setIsRegistering(false)} />
  ) : (
    <Login onLogin={handleLogin} onSwitch={() => setIsRegistering(true)} />
  );
}

export default App;
