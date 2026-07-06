import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function Chat({ user }) {
    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [language, setLanguage] = useState('fr');

    const translations = {
        fr: {
            title: "Assistant d'Examen Camerounais",
            examPlaceholder: "Sélectionner Examen",
            subjectPlaceholder: "Sélectionner Matière",
            inputPlaceholder: "Posez votre question...",
            send: "Envoyer",
            toggle: "English"
        },
        en: {
            title: "Cameroon Exam Assistant",
            examPlaceholder: "Select Exam",
            subjectPlaceholder: "Select Subject",
            inputPlaceholder: "Ask your question...",
            send: "Send",
            toggle: "Français"
        }
    };

    const t = translations[language];

    useEffect(() => {
        fetch(`${API_URL}/exams.php`)
            .then(res => res.json())
            .then(data => setExams(data));
    }, []);

    const sendMessage = async () => {
        if (!message) return;
        const res = await fetch(`${API_URL}/chat.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                message,
                exam_id: selectedExam,
                subject_id: selectedSubject,
                language: language
            })
        });
        const data = await res.json();
        setChatLog([...chatLog, { user: message, bot: data.response }]);
        setMessage('');
    };

    return (
        <div className="chat-container">
            <div className="language-toggle">
                <button onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')} style={{width: 'auto'}}>
                    {t.toggle}
                </button>
            </div>
            <h2>{t.title}</h2>
            <div className="selectors">
                <select onChange={e => setSelectedExam(e.target.value)}>
                    <option value="">{t.examPlaceholder}</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select onChange={e => setSelectedSubject(e.target.value)}>
                    <option value="">{t.subjectPlaceholder}</option>
                    {exams.find(e => e.id == selectedExam)?.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="chat-box">
                {chatLog.map((chat, i) => (
                    <div key={i}>
                        <p><strong>{language === 'fr' ? 'Vous' : 'You'}:</strong> {chat.user}</p>
                        <p><strong>IA:</strong> {chat.bot}</p>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder={t.inputPlaceholder} />
                <button onClick={sendMessage}>{t.send}</button>
            </div>
        </div>
    );
}

export default Chat;
