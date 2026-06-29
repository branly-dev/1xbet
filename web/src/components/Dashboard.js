// web/src/components/Dashboard.js
const Dashboard = ({ user, token }) => {
    const [exams, setExams] = React.useState([]);
    const [selectedExam, setSelectedExam] = React.useState(null);
    const [subjects, setSubjects] = React.useState([]);
    const [message, setMessage] = React.useState('');
    const [chatHistory, setChatHistory] = React.useState([]);

    React.useEffect(() => {
        fetch('/api/endpoints/exams.php')
            .then(res => res.json())
            .then(data => setExams(data));
    }, []);

    const handleExamSelect = (examId) => {
        setSelectedExam(examId);
        fetch(`/api/endpoints/subjects.php?exam_id=${examId}`)
            .then(res => res.json())
            .then(data => setSubjects(data));
    };

    const handleSendMessage = async () => {
        if (!message) return;
        const response = await fetch('/api/endpoints/chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        setChatHistory([...chatHistory, { user: message, bot: data.response }]);
        setMessage('');
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-4">
                    <div className="card p-3 mb-3">
                        <h4>Choisir un examen</h4>
                        {exams.map(exam => (
                            <button
                                key={exam.id}
                                className={`btn mb-2 ${selectedExam === exam.id ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleExamSelect(exam.id)}
                            >
                                {exam.name}
                            </button>
                        ))}
                    </div>
                    {selectedExam && (
                        <div className="card p-3">
                            <h4>Matières</h4>
                            <ul className="list-group">
                                {subjects.map(subject => (
                                    <li key={subject.id} className="list-group-item">{subject.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="col-md-8">
                    <div className="card p-3" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                        <h4>Assistant IA</h4>
                        <div className="chat-history flex-grow-1 overflow-auto mb-3" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                            {chatHistory.map((chat, index) => (
                                <div key={index} className="mb-2">
                                    <p><strong>Vous:</strong> {chat.user}</p>
                                    <p className="text-primary"><strong>IA:</strong> {chat.bot}</p>
                                </div>
                            ))}
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Posez votre question sur l'examen..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleSendMessage}>Envoyer</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
