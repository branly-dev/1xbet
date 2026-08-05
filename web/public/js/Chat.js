/**
 * Zero-build React Chat / Messages component with professional SaaS communication UI.
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
            const res = await fetch('../../api/endpoints/messages.php', {
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
            const res = await fetch(`../../api/endpoints/messages.php?with_id=${contactId}`, {
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
            const res = await fetch('../../api/endpoints/messages.php', {
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[550px]">
            {/* Contacts list */}
            <div class="border-r border-slate-100 p-4 bg-slate-50/50 flex flex-col">
                <div class="pb-3 border-b border-slate-100 mb-4">
                    <h3 class="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-address-book text-indigo-600"></i>
                        <span>{t.chat} Contacts</span>
                    </h3>
                </div>
                <div class="space-y-2 flex-1 overflow-y-auto max-h-[420px]">
                    {contacts.length === 0 ? (
                        <div class="text-center py-12 text-slate-400 font-semibold space-y-2">
                            <i class="fa-regular fa-folder-open text-3xl"></i>
                            <p class="text-xs">Aucune conversation active.</p>
                        </div>
                    ) : (
                        contacts.map(c => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setSelectedContact(c);
                                    fetchMessages(c.id);
                                }}
                                class={`w-full text-left p-3.5 rounded-xl font-bold flex flex-col gap-1 transition ${
                                    selectedContact?.id === c.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                        : 'hover:bg-slate-100 text-slate-700 bg-white border border-slate-100'
                                }`}
                            >
                                <div class="flex justify-between items-center w-full">
                                    <span class="text-sm tracking-tight">{c.nom}</span>
                                    <span class={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                        selectedContact?.id === c.id
                                            ? 'bg-indigo-750 text-indigo-100'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {c.role === 'vendeur' ? t.seller : t.buyer}
                                    </span>
                                </div>
                                <span class={`text-xs font-semibold ${selectedContact?.id === c.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                    {c.email}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Conversation detail */}
            <div class="col-span-2 flex flex-col justify-between p-6 bg-white">
                {selectedContact ? (
                    <>
                        {/* Selected Header */}
                        <div class="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-sm">
                                    {selectedContact.nom.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <span class="font-extrabold text-base text-slate-900 block leading-tight">{selectedContact.nom}</span>
                                    <span class="text-xs text-slate-400 font-semibold">Discussion directe active</span>
                                </div>
                            </div>
                            <span class="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs rounded-full font-extrabold uppercase tracking-wider">
                                {selectedContact.role === 'vendeur' ? t.seller : t.buyer}
                            </span>
                        </div>

                        {/* Message list */}
                        <div class="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[350px]">
                            {messages.map(m => (
                                <div key={m.id} class={`flex flex-col ${m.expediteur_id === user.id ? 'items-end' : 'items-start'}`}>
                                    <div class={`px-4 py-3 rounded-2xl text-sm max-w-[75%] shadow-sm leading-relaxed font-semibold ${
                                        m.expediteur_id === user.id
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                                    }`}>
                                        <p>{m.contenu}</p>
                                    </div>
                                    <span class="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                        {m.cree_le} {m.expediteur_id === user.id && m.lu === 1 ? '• Lu' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSend} class="border-t border-slate-100 pt-4 mt-4 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder={t.write_message}
                                class="flex-1 px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                            />
                            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-1.5 text-sm">
                                <span>{t.send}</span>
                                <i class="fa-regular fa-paper-plane"></i>
                            </button>
                        </form>
                    </>
                ) : (
                    <div class="flex-1 flex flex-col items-center justify-center text-slate-400/80 py-16 space-y-4">
                        <div class="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                            <i class="fa-solid fa-message-captions text-4xl"></i>
                        </div>
                        <div class="text-center space-y-1">
                            <p class="text-base font-extrabold text-slate-700">Aucune discussion active</p>
                            <p class="text-xs text-slate-400 font-bold">Sélectionnez une discussion de commerçant à gauche pour commencer à échanger</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Attach component to global window scope
window.Chat = Chat;
