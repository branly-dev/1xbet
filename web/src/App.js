const { useState, useEffect } = React;

const App = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
    const t = window.translations[lang];

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const toggleLang = () => {
        const newLang = lang === 'fr' ? 'en' : 'fr';
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    return (
        <div className="min-h-screen">
            <button
                onClick={toggleLang}
                className="fixed top-4 right-4 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 z-50 font-bold"
            >
                {t.switchLang}
            </button>
            {!user ? (
                <window.Login onLogin={handleLogin} lang={lang} t={t} />
            ) : (
                <window.Chat user={user} lang={lang} t={t} onLogout={handleLogout} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
