// web/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/endpoints/login.php', {
                username,
                password
            });
            onLoginSuccess({ username, token: response.data.token });
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion');
        }
    };

    return (
        <div className="login-card" style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>Connexion</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0084ff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                    Se connecter
                </button>
            </form>
        </div>
    );
};

export default Login;
