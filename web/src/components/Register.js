import React, { useState } from 'react';
import { API_URL } from '../config';

const localT = {
  fr: {
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    confirmMdp: "Confirmer le mot de passe",
    error: "Erreur d'inscription",
    networkError: "Erreur réseau",
    success: "Inscription réussie !"
  },
  en: {
    username: "Username",
    password: "Password",
    confirmMdp: "Confirm Password",
    error: "Registration error",
    networkError: "Network error",
    success: "Registration successful!"
  }
};

function Register({ onRegister, onSwitch, lang, t }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const lt = localT[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(lt.success);
        setTimeout(() => onRegister(), 2000);
      } else {
        setError(data.error || lt.error);
      }
    } catch (err) {
      setError(lt.networkError);
    }
  };

  return (
    <div className="auth-form">
      <h2>{t.inscription}</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
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
        <button type="submit">{t.inscription}</button>
      </form>
      <p>
        {t.switchLogin.split('?')[0]}? <button onClick={onSwitch}>{t.switchLogin.split('?')[1]}</button>
      </p>
    </div>
  );
}

export default Register;
