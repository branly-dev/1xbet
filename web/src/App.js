import React, { useState } from 'react';
import Chat from './components/Chat';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      {user ? <Chat user={user} /> : <Login onLogin={setUser} />}
    </div>
  );
}

export default App;
