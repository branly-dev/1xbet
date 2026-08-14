const Chat = ({ user, lang, t, onLogout }) => {
    const [exams, setExams] = React.useState([]);
    const [selectedExam, setSelectedExam] = React.useState('');
    const [selectedSubject, setSelectedSubject] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [chatHistory, setChatHistory] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        fetch('/api/endpoints/exams.php')
            .then(res => res.json())
            .then(data => setExams(data));
    }, []);

    const handleSend = async () => {
        if (!message || !selectedExam || !selectedSubject) return;
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
                    subject_id: selectedSubject,
                    language: lang
                })
            });
            const data = await response.json();
            setChatHistory([...chatHistory, { message, response: data.response }]);
            setMessage('');
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const currentSubjects = exams.find(e => e.id == selectedExam)?.subjects || [];

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
            <header className="flex justify-between items-center mb-4 bg-white p-4 rounded shadow">
                <h1 className="text-xl font-bold text-blue-600">{t.examAssistant}</h1>
                <div className="flex gap-4">
                    <span className="text-gray-600">Hi, {user.username}</span>
                    <button onClick={onLogout} className="text-red-500 hover:underline">{t.logout}</button>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                    className="p-2 border rounded"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                >
                    <option value="">{t.selectExam}</option>
                    {exams.map(e => (
                        <option key={e.id} value={e.id}>{lang === 'fr' ? e.name_fr : e.name_en}</option>
                    ))}
                </select>
                <select
                    className="p-2 border rounded"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedExam}
                >
                    <option value="">{t.selectSubject}</option>
                    {currentSubjects.map(s => (
                        <option key={s.id} value={s.id}>{lang === 'fr' ? s.name_fr : s.name_en}</option>
                    ))}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 bg-white rounded shadow p-4 space-y-4">
                {chatHistory.map((chat, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-end">
                            <div className="bg-blue-100 p-3 rounded-lg max-w-xs">{chat.message}</div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg max-w-md">{chat.response}</div>
                        </div>
                    </div>
                ))}
                {loading && <p className="text-center text-gray-500 italic">Thinking...</p>}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder={t.typeMessage}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    {t.send}
                </button>
            </div>
        </div>
    );
};

window.Chat = Chat;
