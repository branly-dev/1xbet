import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/exams.php`)
      .then(res => {
        setExams(res.data);
        if (res.data.length > 0) {
            setSelectedExam(res.data[0].name);
            setSelectedSubject(res.data[0].subjects[0]?.name || '');
        }
      });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages([...messages, userMsg]);
    setInput('');

    try {
      const res = await axios.post(`${API_URL}/chat.php`, {
        message: input,
        exam_id: selectedExam,
        subject_id: selectedSubject,
        language: 'fr'
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(prev => [...prev, { text: res.data.response, sender: 'ai' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: "Erreur: Impossible de contacter l'assistant.", sender: 'ai' }]);
    }
  };

  const handleExamChange = (examName) => {
    setSelectedExam(examName);
    const exam = exams.find(e => e.name === examName);
    if (exam && exam.subjects.length > 0) {
        setSelectedSubject(exam.subjects[0].name);
    }
  };

  return (
    <div className="chat-container">
      <div className="selectors">
        <select value={selectedExam} onChange={e => handleExamChange(e.target.value)}>
          {exams.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
          {exams.find(e => e.name === selectedExam)?.subjects.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}-message`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Posez votre question ici..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
}

export default Chat;
