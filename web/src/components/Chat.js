import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { translations } from '../translations';

function Chat({ token, language, onLogout }) {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const t = translations[language];

    useEffect(() => {
        fetch(`${API_URL}/exams.php`)
            .then(res => res.json())
            .then(data => setExams(data));
    }, []);

    useEffect(() => {
        if (selectedExam) {
            const exam = exams.find(e => e.id == selectedExam);
            setSubjects(exam ? exam.subjects : []);
        }
    }, [selectedExam, exams]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message) return;

        const userMsg = { role: 'user', text: message };
        setChat([...chat, userMsg]);

        try {
            const response = await fetch(`${API_URL}/chat.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message,
                    exam_id: selectedExam,
                    subject_id: selectedSubject,
                    language
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setChat(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setChat(prev => [...prev, { role: 'error', text: data.error }]);
            }
        } catch (err) {
            setChat(prev => [...prev, { role: 'error', text: 'Connection error' }]);
        }
        setMessage('');
    };

    return (
        <div className="chat-container">
            <header>
                <h2>{t.welcome}</h2>
                <button onClick={onLogout}>{t.logout}</button>
            </header>
            <div className="selectors">
                <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                    <option value="">{t.select_exam}</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedExam}>
                    <option value="">{t.select_subject}</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="chat-box">
                {chat.map((msg, i) => (
                    <div key={i} className={`msg ${msg.role}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder={t.message_placeholder}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                <button type="submit">{t.send}</button>
            </form>
        </div>
    );
}

export default Chat;
