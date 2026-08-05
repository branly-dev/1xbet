/**
 * Zero-build React Login component with stunning professional design.
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
        <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 transition duration-300">
                <div>
                    <div class="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <i class="fa-solid fa-shop text-2xl"></i>
                    </div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isRegister ? t.register : t.login}
                    </h2>
                    <p class="mt-2 text-center text-sm text-slate-500">
                        {isRegister ? 'Créez votre accès professionnel' : 'Accédez à votre espace commerçant'}
                    </p>
                </div>

                {error && (
                    <div class="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm border border-rose-100 flex items-center gap-3">
                        <i class="fa-solid fa-circle-exclamation text-base"></i>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div class="bg-teal-50 text-teal-700 p-4 rounded-xl text-sm border border-teal-100 flex items-center gap-3">
                        <i class="fa-solid fa-circle-check text-base"></i>
                        <span>{success}</span>
                    </div>
                )}

                <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div class="space-y-4">
                        {isRegister && (
                            <>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t.name}</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <i class="fa-solid fa-user"></i>
                                        </div>
                                        <input type="text" value={nom} onChange={e => setNom(e.target.value)} required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-800 transition text-sm font-medium" placeholder="Jean-Pierre Ngué" />
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t.phone}</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <i class="fa-solid fa-phone"></i>
                                        </div>
                                        <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-800 transition text-sm font-medium" placeholder="+237670000001" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t.email}</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <i class="fa-solid fa-envelope"></i>
                                </div>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-800 transition text-sm font-medium" placeholder="nom@exemple.cm" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t.password}</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <i class="fa-solid fa-lock"></i>
                                </div>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-800 transition text-sm font-medium" placeholder="••••••••" />
                            </div>
                        </div>

                        {isRegister && (
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t.role}</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <i class="fa-solid fa-briefcase"></i>
                                    </div>
                                    <select value={role} onChange={e => setRole(e.target.value)} class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none bg-white text-slate-800 transition text-sm font-medium">
                                        <option value="acheteur">{t.buyer}</option>
                                        <option value="vendeur">{t.seller}</option>
                                        <option value="admin">{t.admin}</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                        <span>{isRegister ? t.sign_up : t.sign_in}</span>
                        <i class="fa-solid fa-arrow-right-to-bracket text-sm"></i>
                    </button>
                </form>

                <div class="text-center pt-2">
                    <button onClick={() => setIsRegister(!isRegister)} class="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition">
                        {isRegister ? t.have_account : t.no_account}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Attach component to global window scope
window.Login = Login;
