const Login = ({ onLogin, lang, t }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isRegister, setIsRegister] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = isRegister ? 'register' : 'login';
        try {
            const response = await fetch('/api/endpoints/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, username, password })
            });
            const data = await response.json();
            if (response.ok) {
                if (isRegister) {
                    setIsRegister(false);
                    setError('Registration successful, please login');
                } else {
                    onLogin(data);
                }
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">
                    {isRegister ? t.register : t.login}
                </h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">{t.username}</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mt-1"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">{t.password}</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded mt-1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        {isRegister ? t.register : t.login}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    {isRegister ? "Already have an account?" : t.dontHaveAccount}{" "}
                    <button className="text-blue-600 font-bold" onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? t.login : t.register}
                    </button>
                </p>
            </div>
        </div>
    );
};

window.Login = Login;
