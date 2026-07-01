import React, { useState, useEffect } from 'react';

function Chat({ user }) {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/endpoints/exams.php')
      .then(res => res.json())
      .then(data => setExams(data));
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetch(`/api/endpoints/subjects.php?exam_id=${selectedExam}`)
        .then(res => res.json())
        .then(data => setSubjects(data));
    } else {
      setSubjects([]);
    }
  }, [selectedExam]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { role: 'user', content: message };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/endpoints/chat.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message,
          exam_id: selectedExam,
          subject_id: selectedSubject
        }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion avec l\'IA' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="selectors">
        <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
          <option value="">Choisir un examen</option>
          {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedExam}>
          <option value="">Choisir une matière</option>
          {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
        </select>
      </div>

      <div className="messages">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`message ${chat.role}`}>
            <strong>{chat.role === 'user' ? 'Moi' : 'Assistant'} :</strong>
            <p>{chat.content}</p>
          </div>
        ))}
        {loading && <p>L'assistant réfléchit...</p>}
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          placeholder="Posez votre question ici..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Envoyer</button>
      </form>
    </div>
  );
}

export default Chat;
