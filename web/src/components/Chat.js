// web/src/components/Chat.js
function renderChat() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Assistant IA Examens</h1>
        <div id="chat-box"></div>
        <div class="form-group">
            <input type="text" id="chat-input" placeholder="Posez votre question ici...">
            <button id="send-btn">Envoyer</button>
        </div>
        <button id="logout-btn" style="background-color: #666;">Déconnexion</button>
    `;

    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const token = localStorage.getItem('token');

    document.getElementById('send-btn').onclick = async () => {
        const message = chatInput.value;
        if (!message) return;

        appendMessage('Moi', message, 'user');
        chatInput.value = '';

        const resp = await fetch('/api/endpoints/assistant/chat.php', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ message })
        });
        const data = await resp.json();
        appendMessage('IA', data.response || 'Erreur', 'ai');
    };

    function appendMessage(sender, text, type) {
        const div = document.createElement('div');
        div.className = 'message ' + type;

        const senderStrong = document.createElement('strong');
        senderStrong.textContent = sender + ': ';
        div.appendChild(senderStrong);

        const textNode = document.createTextNode(text);
        div.appendChild(textNode);

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('logout-btn').onclick = () => {
        localStorage.removeItem('token');
        location.reload();
    };
}
