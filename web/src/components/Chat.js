import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const localT = {
  fr: {
    chooseExam: "Choisir un examen",
    chooseSubject: "Choisir une matière",
    placeholder: "Posez votre question ici...",
    send: "Envoyer",
    thinking: "L'assistant réfléchit...",
    errorConn: "Erreur de connexion avec l'IA",
    moi: "Moi",
    assistant: "Assistant"
  },
  en: {
    chooseExam: "Choose an exam",
    chooseSubject: "Choose a subject",
    placeholder: "Ask your question here...",
    send: "Send",
    thinking: "Assistant is thinking...",
    errorConn: "Connection error with AI",
    moi: "Me",
    assistant: "Assistant"
  }
};

function Chat({ user, lang }) {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const lt = localT[lang];

  useEffect(() => {
    fetch(`${API_URL}/exams.php`)
      .then(res => res.json())
      .then(data => setExams(data));
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetch(`${API_URL}/subjects.php?exam_id=${selectedExam}`)
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
      const response = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message,
          exam_id: selectedExam,
          subject_id: selectedSubject,
          language: lang
        }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: lt.errorConn }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="selectors">
        <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
          <option value="">{lt.chooseExam}</option>
          {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedExam}>
          <option value="">{lt.chooseSubject}</option>
          {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
        </select>
      </div>

      <div className="messages">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`message ${chat.role}`}>
            <strong>{chat.role === 'user' ? lt.moi : lt.assistant} :</strong>
            <p>{chat.content}</p>
          </div>
        ))}
        {loading && <p className="thinking">{lt.thinking}</p>}
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          placeholder={lt.placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{lt.send}</button>
      </form>
    </div>
  );
}

export default Chat;
