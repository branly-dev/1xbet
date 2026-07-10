import React, { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import './style.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [language, setLanguage] = useState('fr');

    const handleLogin = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <div className="App">
            <div className="lang-switcher">
                <button onClick={() => setLanguage('fr')}>FR</button>
                <button onClick={() => setLanguage('en')}>EN</button>
            </div>
            {!token ? (
                <Login onLogin={handleLogin} language={language} />
            ) : (
                <Chat token={token} language={language} onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;
