import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

function Chat({ token, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [exam, setExam] = useState('BAC');
  const [subject, setSubject] = useState('Mathématiques');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input, exam, subject }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'Erreur: ' + (data.error || 'Inconnu') }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Erreur réseau' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2>Bonjour, {username}</h2>
      <div className="controls">
        <select value={exam} onChange={(e) => setExam(e.target.value)}>
          <option value="BAC">BAC</option>
          <option value="Probatoire">Probatoire</option>
          <option value="BEPC">BEPC</option>
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="Mathématiques">Mathématiques</option>
          <option value="Physique">Physique</option>
          <option value="Français">Français</option>
          <option value="Anglais">Anglais</option>
        </select>
      </div>
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message bot-message">En train de réfléchir...</div>}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question ici..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Envoyer</button>
      </form>
    </div>
  );
}

export default Chat;
