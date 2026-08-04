/**
 * Zero-build React Chat / Messages component.
 */

function Chat({ token, lang, user }) {
    const [contacts, setContacts] = React.useState([]);
    const [selectedContact, setSelectedContact] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const t = translations[lang];

    React.useEffect(() => {
        fetchContacts();
        const interval = setInterval(() => {
            if (selectedContact) {
                fetchMessages(selectedContact.id);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedContact]);

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/endpoints/messages.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (contactId) => {
        try {
            const res = await fetch(`/api/endpoints/messages.php?with_id=${contactId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const res = await fetch('/api/endpoints/messages.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    destinataire_id: selectedContact.id,
                    contenu: newMessage
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedContact.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl shadow-md border overflow-hidden min-h-[500px]">
            {/* Contacts list */}
            <div class="border-r p-4 bg-gray-50">
                <h3 class="font-bold text-lg mb-4 text-gray-700">{t.chat}</h3>
                <div class="space-y-2">
                    {contacts.length === 0 ? (
                        <p class="text-sm text-gray-500 italic">Aucune conversation active.</p>
                    ) : (
                        contacts.map(c => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setSelectedContact(c);
                                    fetchMessages(c.id);
                                }}
                                class={`w-full text-left p-3 rounded-lg font-semibold flex flex-col transition ${
                                    selectedContact?.id === c.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                                }`}
                            >
                                <span>{c.nom}</span>
                                <span class={`text-xs ${selectedContact?.id === c.id ? 'text-indigo-100' : 'text-gray-500'}`}>
                                    {c.role === 'vendeur' ? t.seller : t.buyer}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Conversation detail */}
            <div class="col-span-2 flex flex-col justify-between p-4">
                {selectedContact ? (
                    <>
                        {/* Selected Header */}
                        <div class="border-b pb-3 mb-3 flex justify-between items-center">
                            <span class="font-bold text-lg text-indigo-700">{selectedContact.nom}</span>
                            <span class="bg-indigo-50 text-indigo-600 px-2.5 py-1 text-xs rounded-full font-bold">
                                {selectedContact.role === 'vendeur' ? t.seller : t.buyer}
                            </span>
                        </div>

                        {/* Message list */}
                        <div class="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[350px]">
                            {messages.map(m => (
                                <div key={m.id} class={`flex flex-col ${m.expediteur_id === user.id ? 'items-end' : 'items-start'}`}>
                                    <div class={`px-4 py-2 rounded-xl text-sm max-w-[80%] shadow-sm ${
                                        m.expediteur_id === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                        <p>{m.contenu}</p>
                                    </div>
                                    <span class="text-[10px] text-gray-400 mt-1">{m.cree_le}</span>
                                </div>
                            ))}
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSend} class="border-t pt-3 mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder={t.write_message}
                                class="flex-1 px-4 py-2 border rounded-full focus:ring focus:ring-indigo-200 outline-none"
                            />
                            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-full transition">
                                {t.send}
                            </button>
                        </form>
                    </>
                ) : (
                    <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <p class="text-sm font-semibold">Sélectionnez une discussion pour commencer à échanger</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Attach component to global window scope so other scripts loaded without bundler can resolve it
window.Chat = Chat;
