import React, { useState } from 'react';

function Register({ onRegister, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/endpoints/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Compte créé ! Vous pouvez vous connecter.');
        setTimeout(onRegister, 2000);
      } else {
        setError(data.error || 'Erreur d\'inscription');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="auth-form">
      <h2>Inscription</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
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
        Déjà un compte ? <button onClick={onSwitch}>Se connecter</button>
      </p>
    </div>
  );
}

export default Register;
