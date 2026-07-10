import React, { useState } from 'react';
import { API_URL } from '../config';
import { translations } from '../translations';

function Login({ onLogin, language }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const t = translations[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const action = isLogin ? 'login' : 'register';
        try {
            const response = await fetch(`${API_URL}/auth.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                if (isLogin) {
                    onLogin(data.token);
                } else {
                    setIsLogin(true);
                    alert('Registration successful, please login.');
                }
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="login-container">
            <h2>{isLogin ? t.login : t.register}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder={t.username} value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">{isLogin ? t.login : t.register}</button>
            </form>
            {error && <p className="error">{error}</p>}
            <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? t.no_account : t.have_account}
            </button>
        </div>
    );
}

export default Login;
