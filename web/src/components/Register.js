import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function Register({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Compte créé ! Vous pouvez vous connecter.');
        setError('');
      } else {
        setError(data.error || 'Erreur d\'inscription');
        setMessage('');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="auth-form">
      <h2>Inscription</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
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
        <button type="submit">S'inscrire</button>
      </form>
      <p>
        Déjà un compte ? <button onClick={onSwitch} style={{background: 'none', color: '#1a73e8', border: 'none', cursor: 'pointer', padding: 0}}>Se connecter</button>
      </p>
    </div>
  );
}

export default Register;
