import React, { useState } from 'react';
import { API_URL } from '../config';

const localT = {
  fr: {
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    error: "Erreur de connexion",
    networkError: "Erreur réseau"
  },
  en: {
    username: "Username",
    password: "Password",
    error: "Login error",
    networkError: "Network error"
  }
};

function Login({ onLogin, onSwitch, lang, t }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const lt = localT[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.error || lt.error);
      }
    } catch (err) {
      setError(lt.networkError);
    }
  };

  return (
    <div className="auth-form">
      <h2>{t.connexion}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={lt.username}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={lt.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t.connexion}</button>
      </form>
      <p>
        {t.switchRegister.split('?')[0]}? <button onClick={onSwitch}>{t.switchRegister.split('?')[1]}</button>
      </p>
    </div>
  );
}

export default Login;
