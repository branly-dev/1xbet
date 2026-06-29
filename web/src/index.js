// web/src/index.js
const App = () => {
    const [user, setUser] = React.useState(null);
    const [token, setToken] = React.useState(null);
    const [showRegister, setShowRegister] = React.useState(false);

    const handleLogin = (data) => {
        setUser(data.user);
        setToken(data.token);
    };

    if (user) {
        return <Dashboard user={user} token={token} />;
    }

    return (
        <div className="container mt-5">
            <div className="text-center mb-4">
                <h1>Assistant Examens Camerounais</h1>
                <p className="lead">Préparation simplifiée pour le BAC, le Probatoire et le BEPC.</p>
            </div>
            {showRegister ? (
                <Register onRegisterSuccess={() => setShowRegister(false)} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
            <div className="text-center mt-3">
                <button className="btn btn-link" onClick={() => setShowRegister(!showRegister)}>
                    {showRegister ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
                </button>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<App />);
