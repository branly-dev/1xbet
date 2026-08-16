// web/src/components/Login.js
function renderLogin(onLogin) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Connexion</h1>
        <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" id="username" placeholder="Entrez votre nom">
        </div>
        <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="password" placeholder="Entrez votre mot de passe">
        </div>
        <button id="login-btn">Se connecter</button>
        <p style="text-align:center">Nouveau ? <a href="#" id="show-register">S'inscrire</a></p>
    `;

    document.getElementById('show-register').onclick = (e) => {
        e.preventDefault();
        renderRegister(() => renderLogin(onLogin));
    };

    document.getElementById('login-btn').onclick = async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const resp = await fetch('/api/endpoints/auth/login.php', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            onLogin();
        } else {
            alert('Erreur: ' + (data.error || 'Connexion échouée'));
        }
    };
}
