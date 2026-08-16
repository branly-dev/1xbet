import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/endpoints';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login.php`, { username, password });
      setToken(res.data.jwt);
      setUser(res.data.username);
      localStorage.setItem('token', res.data.jwt);
      setError('');
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register.php`, { username, password });
      setIsRegistering(false);
      setError('Compte créé ! Connectez-vous.');
    } catch (err) {
      setError('Erreur lors de la création du compte');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Assistant Examens Cameroun</h1>
          <p style={styles.subtitle}>Réussissez votre BAC, Probatoire ou BEPC avec l'IA</p>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={styles.form}>
            <input
              style={styles.input}
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{color: error.includes('créé') ? 'green' : 'red'}}>{error}</p>}
            <button type="submit" style={styles.button}>
              {isRegistering ? "S'INSCRIRE" : "SE CONNECTER"}
            </button>
          </form>
          <p style={{ marginTop: '20px' }}>
            {isRegistering ? "Déjà un compte ?" : "Pas encore de compte ?"}
            <button
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isRegistering ? " Connexion" : " S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Mon Assistant IA</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
      </header>
      <Chat token={token} />
    </div>
  );
}

function Chat({ token }) {
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Je suis ton assistant pour les examens. Comment puis-je t'aider aujourd'hui ?", isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, isAi: false }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat.php`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...newMessages, { text: res.data.response, isAi: true }]);
    } catch (err) {
      setMessages([...newMessages, { text: "Désolé, une erreur est survenue.", isAi: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messagesList}>
        {messages.map((m, i) => (
          <div key={i} style={m.isAi ? styles.aiMsg : styles.userMsg}>
            {m.text}
          </div>
        ))}
        {loading && <div style={styles.aiMsg}>...</div>}
      </div>
      <div style={styles.inputArea}>
        <input
          style={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question ici (ex: Aide moi en Maths)"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>ENVOYER</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f2f5',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    margin: 'auto',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: { color: '#0056b3', fontSize: '24px' },
  subtitle: { color: '#666', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column' },
  input: {
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '15px',
    backgroundColor: '#0056b3',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  header: {
    backgroundColor: '#0056b3',
    color: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  messagesList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '20px',
  },
  aiMsg: {
    backgroundColor: '#e4e6eb',
    padding: '15px',
    borderRadius: '15px 15px 15px 0',
    marginBottom: '10px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  userMsg: {
    backgroundColor: '#0056b3',
    color: 'white',
    padding: '15px',
    borderRadius: '15px 15px 0 15px',
    marginBottom: '10px',
    maxWidth: '80%',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  sendBtn: {
    padding: '15px 25px',
    backgroundColor: '#00a884',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};

export default App;
