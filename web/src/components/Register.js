// web/src/components/Register.js
function renderRegister(onRegistered) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Inscription</h1>
        <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" id="reg-username" placeholder="Choisissez un nom">
        </div>
        <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="reg-password" placeholder="Mot de passe">
        </div>
        <div class="form-group">
            <label>Examen</label>
            <select id="reg-exam">
                <option value="BAC">BAC</option>
                <option value="Probatoire">Probatoire</option>
                <option value="BEPC">BEPC</option>
            </select>
        </div>
        <button id="reg-btn">S'inscrire</button>
        <p style="text-align:center">Déjà un compte ? <a href="#" id="show-login">Se connecter</a></p>
    `;

    document.getElementById('reg-btn').onclick = async () => {
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const exam_type = document.getElementById('reg-exam').value;

        const resp = await fetch('/api/endpoints/auth/register.php', {
            method: 'POST',
            body: JSON.stringify({ username, password, exam_type })
        });
        const data = await resp.json();
        if (data.message) {
            alert('Inscription réussie ! Veuillez vous connecter.');
            onRegistered();
        } else {
            alert('Erreur: ' + (data.error || 'Échec de l\'inscription'));
        }
    };

    document.getElementById('show-login').onclick = (e) => {
        e.preventDefault();
        renderLogin(() => initApp());
    };
}
