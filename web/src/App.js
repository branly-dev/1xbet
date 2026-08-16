// web/src/App.js

// Simple router/manager
function initApp() {
    const token = localStorage.getItem('token');
    if (token) {
        renderChat();
    } else {
        renderLogin(() => initApp());
    }
}

// Load components and init
async function load() {
    // In a real app we'd use modules, here we'll just inject scripts or assume they are loaded
    const scripts = ['web/src/components/Login.js', 'web/src/components/Register.js', 'web/src/components/Chat.js'];
    for (const src of scripts) {
        const s = document.createElement('script');
        s.src = '/' + src;
        document.head.appendChild(s);
        await new Promise(r => s.onload = r);
    }
    initApp();
}

load();
