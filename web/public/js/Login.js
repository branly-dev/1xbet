/**
 * Zero-build React Login component.
 */

function Login({ setToken, setUser, lang }) {
    const [isRegister, setIsRegister] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [nom, setNom] = React.useState('');
    const [telephone, setTelephone] = React.useState('');
    const [role, setRole] = React.useState('acheteur');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const t = translations[lang];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const payload = isRegister
            ? { action: 'register', nom, email, telephone, password, role, langue: lang }
            : { action: 'login', email, password };

        try {
            const res = await fetch('../../api/endpoints/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue');
                return;
            }

            if (isRegister) {
                setSuccess(t.sign_up + ' réussie ! Connectez-vous maintenant.');
                setIsRegister(false);
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setToken(data.token);
                setUser(data.user);
            }
        } catch (err) {
            setError('Impossible de joindre le serveur API.');
        }
    };

    return (
        <div class="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 class="text-2xl font-bold text-center mb-6 text-indigo-600">
                {isRegister ? t.register : t.login}
            </h2>

            {error && <div class="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}
            {success && <div class="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm border border-green-200">{success}</div>}

            <form onSubmit={handleSubmit} class="space-y-4">
                {isRegister && (
                    <>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.name}</label>
                            <input type="text" value={nom} onChange={e => setNom(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 outline-none" placeholder="Jean-Pierre Ngué" />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.phone}</label>
                            <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 outline-none" placeholder="+237670000001" />
                        </div>
                    </>
                )}

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">{t.email}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 outline-none" placeholder="nom@exemple.cm" />
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 outline-none" placeholder="••••••••" />
                </div>

                {isRegister && (
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.role}</label>
                        <select value={role} onChange={e => setRole(e.target.value)} class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 outline-none bg-white">
                            <option value="acheteur">{t.buyer}</option>
                            <option value="vendeur">{t.seller}</option>
                            <option value="admin">{t.admin}</option>
                        </select>
                    </div>
                )}

                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition">
                    {isRegister ? t.sign_up : t.sign_in}
                </button>
            </form>

            <div class="mt-6 text-center">
                <button onClick={() => setIsRegister(!isRegister)} class="text-indigo-600 hover:underline text-sm font-semibold">
                    {isRegister ? t.have_account : t.no_account}
                </button>
            </div>
        </div>
    );
}

// Attach component to global window scope so other scripts loaded without bundler can resolve it
window.Login = Login;
