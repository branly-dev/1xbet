// web/src/components/Register.js
const Register = ({ onRegisterSuccess }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [fullName, setFullName] = React.useState('');
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/endpoints/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, full_name: fullName })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Compte créé avec succès ! Vous pouvez vous connecter.');
                setTimeout(() => onRegisterSuccess(), 2000);
            } else {
                setMessage(data.error || 'Erreur lors de l\'inscription');
            }
        } catch (err) {
            setMessage('Erreur réseau');
        }
    };

    return (
        <div className="card p-4">
            <h2 className="text-center mb-4">S'inscrire</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nom complet</label>
                    <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nom d'utilisateur</label>
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-success w-100">Créer mon compte</button>
            </form>
        </div>
    );
};
