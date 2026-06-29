// web/src/components/Login.js
// Composant de connexion pour l'assistant d'examen
const Login = ({ onLogin }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/endpoints/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                onLogin(data);
            } else {
                setError(data.error || 'Erreur de connexion');
            }
        } catch (err) {
            setError('Erreur réseau');
        }
    };

    return (
        <div className="card p-4">
            <h2 className="text-center mb-4">Connexion</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nom d'utilisateur</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mot de passe</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Se connecter</button>
            </form>
        </div>
    );
};
