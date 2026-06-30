// web/src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chat = ({ token }) => {
    const [messages, setMessages] = useState([
        { text: "Bonjour ! Je suis ton assistant spécialisé pour le BAC, Probatoire et BEPC. Comment puis-je t'aider ?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/endpoints/chat.php',
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => [...prev, { text: response.data.response, sender: 'ai' }]);
        } catch (err) {
            setMessages(prev => [...prev, { text: "Désolé, une erreur est survenue. Vérifie ta connexion.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '70vh', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="messages-list" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f9f9f9' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        margin: '0.5rem 0',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        maxWidth: '80%',
                        alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: m.sender === 'user' ? '#0084ff' : '#e4e6eb',
                        color: m.sender === 'user' ? 'white' : 'black',
                        marginLeft: m.sender === 'user' ? 'auto' : '0'
                    }}>
                        {m.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', padding: '1rem', background: 'white', borderTop: '1px solid #ddd' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pose ta question..."
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', marginRight: '0.5rem' }}
                    disabled={loading}
                />
                <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0084ff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                    {loading ? '...' : 'Envoyer'}
                </button>
            </form>
        </div>
    );
};

export default Chat;
