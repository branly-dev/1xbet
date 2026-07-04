import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth.php`, {
        action: isRegistering ? 'register' : 'login',
        username,
        password
      });
      if (isRegistering) {
        setIsRegistering(false);
        alert('Inscription réussie, veuillez vous connecter.');
      } else {
        onLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>{isRegistering ? 'Inscription' : 'Connexion'}</h1>
        {error && <p className="error">{error}</p>}
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
        <button type="submit">{isRegistering ? "S'inscrire" : 'Se connecter'}</button>
        <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-auth">
          {isRegistering ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
        </p>
      </form>
    </div>
  );
}

export default Login;
