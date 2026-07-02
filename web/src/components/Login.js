import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function Login({ onLogin, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.token, data.username);
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="auth-form">
      <h2>Connexion</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      <p>
        Pas de compte ? <button onClick={onSwitch} style={{background: 'none', color: '#1a73e8', border: 'none', cursor: 'pointer', padding: 0}}>S'inscrire</button>
      </p>
    </div>
  );
}

export default Login;
