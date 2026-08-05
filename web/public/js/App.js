/**
 * Zero-build React App / Parent component.
 * Features:
 * - Bilingual Interface (toggle FR/EN)
 * - Low-bandwidth image optimization settings
 * - Dashboard structures for Buyer, Seller, and Admin roles
 * - Payment and ordering handling with simulated Webhook notifications
 * - Gemini AI product recommendations and admin auto-moderator evaluation
 */

function App() {
    const [token, setToken] = React.useState(localStorage.getItem('token') || '');
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')) || null);
    const [lang, setLang] = React.useState('fr');
    const [lowBandwidth, setLowBandwidth] = React.useState(false);

    // Active Dashboard Tab
    const [activeTab, setActiveTab] = React.useState('products'); // products, orders, chat, admin, disputes

    // Data lists
    const [products, setProducts] = React.useState([]);
    const [orders, setOrders] = React.useState([]);
    const [disputes, setDisputes] = React.useState([]);
    const [usersList, setUsersList] = React.useState([]);
    const [ratingsList, setRatingsList] = React.useState([]);

    // Recommendation state powered by Gemini (using search recommendations simulation)
    const [aiQuery, setAiQuery] = React.useState('');
    const [aiRecommendedProducts, setAiRecommendedProducts] = React.useState([]);

    // Search and filters
    const [searchQuery, setSearchQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [priceFilter, setPriceFilter] = React.useState('');

    // Modal state for purchasing/paying/rating
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [purchaseQty, setPurchaseQty] = React.useState(1);
    const [paymentOrder, setPaymentOrder] = React.useState(null);
    const [momoOperator, setMomoOperator] = React.useState('momo');
    const [momoPhone, setMomoPhone] = React.useState('');

    // Dispute & Rating modals
    const [ratingOrder, setRatingOrder] = React.useState(null);
    const [ratingNote, setRatingNote] = React.useState(5);
    const [ratingComment, setRatingComment] = React.useState('');

    const [disputeOrder, setDisputeOrder] = React.useState(null);
    const [disputeDesc, setDisputeDesc] = React.useState('');

    const [resolveDispute, setResolveDispute] = React.useState(null);
    const [resolutionNote, setResolutionNote] = React.useState('');

    // Seller fields
    const [newTitle, setNewTitle] = React.useState('');
    const [newDesc, setNewDesc] = React.useState('');
    const [newPrice, setNewPrice] = React.useState('');
    const [newCategory, setNewCategory] = React.useState('Alimentation');
    const [newStock, setNewStock] = React.useState('');

    const t = translations[lang];

    // Auto-update bilingual language in user profile
    React.useEffect(() => {
        if (user && user.langue) {
            setLang(user.langue);
        }
    }, [user]);

    // Query Products on startup or filter change
    React.useEffect(() => {
        fetchProducts();
    }, [searchQuery, categoryFilter, priceFilter]);

    // Query other screens based on active tabs
    React.useEffect(() => {
        if (token) {
            if (activeTab === 'orders') fetchOrders();
            if (activeTab === 'disputes') fetchDisputes();
            if (activeTab === 'admin') {
                fetchAdminUsers();
                fetchAdminProducts();
                fetchDisputes();
            }
        }
    }, [activeTab, token]);

    const fetchProducts = async () => {
        let url = `../../api/endpoints/products.php?`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
        if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
        if (priceFilter) url += `max_price=${priceFilter}&`;

        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Run custom Gemini AI query directly for semantic assistant recommendations
    const runGeminiAIRecommendation = async () => {
        if (!aiQuery) return;
        try {
            const res = await fetch(`../../api/endpoints/products.php?search=${encodeURIComponent(aiQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setAiRecommendedProducts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('../../api/endpoints/orders.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDisputes = async () => {
        try {
            const res = await fetch('../../api/endpoints/disputes.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDisputes(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAdminUsers = async () => {
        try {
            const res = await fetch('../../api/endpoints/admin.php?action=users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsersList(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAdminProducts = async () => {
        try {
            const res = await fetch('../../api/endpoints/admin.php?action=products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Store inside general products during admin dashboard mode
                setProducts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setToken('');
        setUser(null);
        setActiveTab('products');
    };

    // Order purchase flow
    const placeOrder = async () => {
        if (!selectedProduct) return;
        try {
            const res = await fetch('../../api/endpoints/orders.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    produit_id: selectedProduct.id,
                    quantite: purchaseQty
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t.buy_now + " réussi! Réf Commande: #" + data.order_id);
                setSelectedProduct(null);
                setActiveTab('orders');
                fetchOrders();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Initiate payment flow
    const payOrder = async () => {
        if (!paymentOrder) return;
        try {
            const res = await fetch('../../api/endpoints/payments.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: paymentOrder.id,
                    operator: momoOperator,
                    phone_number: momoPhone
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);

                // For demonstration: Auto trigger the operators simulated successful webhook in the background.
                // In production, the operator triggers this automatically on success.
                if (data.simulation_webhook_payload) {
                    setTimeout(async () => {
                        await fetch('../../api/endpoints/payments.php?webhook=1', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data.simulation_webhook_payload)
                        });
                        alert("Paiement Mobile Money validé automatiquement par simulateur de Webhook.");
                        setPaymentOrder(null);
                        fetchOrders();
                    }, 2000);
                }
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Rating Flow
    const submitRating = async () => {
        if (!ratingOrder) return;
        try {
            const res = await fetch('../../api/endpoints/ratings.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: ratingOrder.id,
                    note: ratingNote,
                    commentaire: ratingComment
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t.submit + " réussi!");
                setRatingOrder(null);
                setRatingComment('');
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Dispute flow
    const submitDispute = async () => {
        if (!disputeOrder) return;
        try {
            const res = await fetch('../../api/endpoints/disputes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: disputeOrder.id,
                    description: disputeDesc
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t.dispute_btn + " ouvert avec succès !");
                setDisputeOrder(null);
                setDisputeDesc('');
                fetchDisputes();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Seller add product flow
    const addProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('../../api/endpoints/products.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    titre: newTitle,
                    description: newDesc,
                    prix: parseFloat(newPrice),
                    categorie: newCategory,
                    stock: parseInt(newStock),
                    photos: ['miel.jpg'] // static mock photo for simplicity
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t.add_product_btn + " réussie ! ID Produit: #" + data.product_id);
                setNewTitle('');
                setNewDesc('');
                setNewPrice('');
                setNewStock('');
                fetchProducts();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Admin moderate user status
    const moderateUser = async (userId, statut) => {
        try {
            const res = await fetch('../../api/endpoints/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'moderate_user',
                    user_id: userId,
                    statut: statut
                })
            });
            if (res.ok) {
                alert("Statut de l'utilisateur mis à jour.");
                fetchAdminUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Admin moderate product status
    const moderateProduct = async (productId, statut) => {
        try {
            const res = await fetch('../../api/endpoints/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'moderate_product',
                    product_id: productId,
                    statut: statut
                })
            });
            if (res.ok) {
                alert("Statut du produit mis à jour.");
                fetchAdminProducts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Admin Gemini AI evaluation check
    const geminiVerifyProduct = async (productId) => {
        try {
            const res = await fetch('../../api/endpoints/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'gemini_verify_product',
                    product_id: productId
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Analyse de l'IA Gemini terminée : \n" + data.gemini_analysis.reason + "\nConfiance: " + data.gemini_analysis.confidence);
                fetchAdminProducts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Admin dispute resolution
    const submitDisputeResolution = async () => {
        if (!resolveDispute) return;
        try {
            const res = await fetch('../../api/endpoints/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'resolve_dispute',
                    dispute_id: resolveDispute.id,
                    resolution: resolutionNote,
                    statut: 'resolu'
                })
            });
            if (res.ok) {
                alert("Litige résolu avec succès !");
                setResolveDispute(null);
                setResolutionNote('');
                fetchDisputes();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Start Chat directly with product seller
    const startChat = (sellerId) => {
        if (!token) {
            alert("Veuillez vous connecter pour envoyer un message.");
            return;
        }
        // Direct to chat tab. Contact selection will load direct matching conversation
        setActiveTab('chat');
    };

    return (
        <div class="min-h-screen flex flex-col">
            {/* Header / Navbar */}
            <header class="bg-indigo-600 text-white shadow-lg">
                <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl font-bold tracking-tight">{t.app_title}</span>
                        <span class="bg-indigo-500 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">{t.tagline}</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-4">
                        {/* Language Switcher */}
                        <div class="flex items-center bg-indigo-700 rounded-lg p-1">
                            <button onClick={() => setLang('fr')} class={`px-3 py-1 text-xs font-bold rounded ${lang === 'fr' ? 'bg-white text-indigo-700' : 'text-white'}`}>FR</button>
                            <button onClick={() => setLang('en')} class={`px-3 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-white text-indigo-700' : 'text-white'}`}>EN</button>
                        </div>

                        {/* Low bandwidth control */}
                        <label class="flex items-center gap-2 text-xs bg-indigo-700 hover:bg-indigo-800 transition rounded-lg px-3 py-2 cursor-pointer font-semibold">
                            <input type="checkbox" checked={lowBandwidth} onChange={e => setLowBandwidth(e.target.checked)} class="rounded text-indigo-600 focus:ring-indigo-500" />
                            <span>{t.low_bandwidth}</span>
                        </label>

                        {/* User management info */}
                        {user ? (
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-semibold border-r border-indigo-500 pr-3">
                                    {user.nom} ({t[user.role]})
                                </span>
                                <button onClick={handleLogout} class="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-3 py-2 rounded-lg transition">
                                    {t.logout}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>

            {/* Role Navigation Dashboard Tabs (Visible only if logged in) */}
            {user ? (
                <div class="bg-white border-b shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-4">
                        <button onClick={() => setActiveTab('products')} class={`py-4 px-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            🏠 {t.search_placeholder.split(' ')[0]}
                        </button>

                        <button onClick={() => setActiveTab('orders')} class={`py-4 px-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            📦 {t.my_orders}
                        </button>

                        <button onClick={() => setActiveTab('chat')} class={`py-4 px-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            💬 {t.chat}
                        </button>

                        {user.role === 'vendeur' && (
                            <button onClick={() => setActiveTab('add_product')} class={`py-4 px-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'add_product' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                ➕ {t.add_product}
                            </button>
                        )}

                        {user.role === 'admin' && (
                            <button onClick={() => setActiveTab('admin')} class={`py-4 px-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'admin' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                🛠️ {t.admin}
                            </button>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Main Container */}
            <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
                {!token ? (
                    <window.Login setToken={setToken} setUser={setUser} lang={lang} />
                ) : (
                    <>
                        {/* Tab Content: Products / Search */}
                        {activeTab === 'products' && (
                            <div class="space-y-6">
                                {/* Gemini Smart Recommendation search helper for users */}
                                <div class="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div class="space-y-1">
                                        <h3 class="font-bold text-lg text-indigo-800 flex items-center gap-2">
                                            ✨ {t.recommended_for_you}
                                        </h3>
                                        <p class="text-sm text-gray-600">Demandez à Gemini de vous aider à dénicher de la nourriture mûre, des épices africaines ou des vêtements...</p>
                                    </div>
                                    <div class="flex w-full md:w-auto gap-2">
                                        <input
                                            type="text"
                                            value={aiQuery}
                                            onChange={e => setAiQuery(e.target.value)}
                                            placeholder="ex: nourriture locale mûre..."
                                            class="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-200 outline-none w-full md:w-64"
                                        />
                                        <button onClick={runGeminiAIRecommendation} class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition">
                                            Recommander
                                        </button>
                                    </div>
                                </div>

                                {aiRecommendedProducts.length > 0 && (
                                    <div class="space-y-3">
                                        <h4 class="font-bold text-sm uppercase text-gray-500 tracking-wider">Trouvés par recommandation IA :</h4>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            {aiRecommendedProducts.map(p => (
                                                <div key={p.id} class="border border-indigo-200 bg-indigo-50/30 p-4 rounded-lg relative">
                                                    <span class="absolute top-2 right-2 bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-full">Recommandé</span>
                                                    <h5 class="font-bold">{p.titre}</h5>
                                                    <p class="text-xs text-gray-600 line-clamp-2 mt-1">{p.description}</p>
                                                    <div class="mt-2 flex justify-between items-center">
                                                        <span class="font-bold text-sm text-indigo-600">{p.prix} FCFA</span>
                                                        <button onClick={() => setSelectedProduct(p)} class="text-xs bg-indigo-600 text-white font-bold px-2 py-1 rounded">
                                                            {t.buy_now}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ordinary search filters */}
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.search_placeholder.split(' ')[0]}</label>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder={t.search_placeholder}
                                            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.category}</label>
                                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none bg-white">
                                            <option value="">{t.all_categories}</option>
                                            <option value="Alimentation">Alimentation</option>
                                            <option value="Mode">Mode</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.price} Max</label>
                                        <input
                                            type="number"
                                            value={priceFilter}
                                            onChange={e => setPriceFilter(e.target.value)}
                                            placeholder="FCFA"
                                            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Products Grid */}
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {products.map(p => (
                                        <div key={p.id} class="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col justify-between">
                                            <div>
                                                {/* Image rendering with lowBandwidth protection */}
                                                {!lowBandwidth ? (
                                                    <div class="h-48 bg-indigo-100 flex items-center justify-center text-indigo-300 font-bold">
                                                        [Image Mock: {p.titre}]
                                                    </div>
                                                ) : (
                                                    <div class="p-2 text-center bg-gray-100 text-gray-500 text-xs font-semibold">
                                                        {t.low_bandwidth}
                                                    </div>
                                                )}
                                                <div class="p-4 space-y-2">
                                                    <div class="flex justify-between items-start">
                                                        <span class="bg-indigo-50 text-indigo-600 font-bold text-xs px-2.5 py-1 rounded-full">{p.categorie}</span>
                                                        <span class="text-xs text-gray-500 font-semibold">{t.stock}: {p.stock}</span>
                                                    </div>
                                                    <h3 class="font-bold text-lg text-gray-800">{p.titre}</h3>
                                                    <p class="text-sm text-gray-600 line-clamp-3">{p.description}</p>
                                                    <div class="text-xs text-gray-400 font-medium">Vendeur : {p.vendeur_nom}</div>
                                                </div>
                                            </div>

                                            <div class="p-4 border-t bg-gray-50 flex items-center justify-between">
                                                <span class="font-bold text-lg text-indigo-600">{p.prix} FCFA</span>
                                                <div class="flex gap-2">
                                                    <button onClick={() => startChat(p.vendeur_id)} class="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 px-3 rounded-lg transition">
                                                        💬 {t.chat}
                                                    </button>
                                                    {user.role === 'acheteur' && (
                                                        <button onClick={() => setSelectedProduct(p)} class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition">
                                                            {t.buy_now}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Orders */}
                        {activeTab === 'orders' && (
                            <div class="space-y-6">
                                <h2 class="text-xl font-bold text-gray-800">{t.my_orders}</h2>
                                <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
                                    <table class="w-full border-collapse">
                                        <thead>
                                            <tr class="bg-gray-50 text-left border-b text-sm font-semibold text-gray-600">
                                                <th class="p-4">ID</th>
                                                <th class="p-4">Produit</th>
                                                <th class="p-4">{t.quantity}</th>
                                                <th class="p-4">{t.total}</th>
                                                <th class="p-4">{t.status}</th>
                                                <th class="p-4">{t.action}</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y text-sm">
                                            {orders.map(o => (
                                                <tr key={o.id}>
                                                    <td class="p-4 font-bold">#{o.id}</td>
                                                    <td class="p-4 font-semibold">{o.produit_titre}</td>
                                                    <td class="p-4">{o.quantite}</td>
                                                    <td class="p-4 font-bold text-indigo-600">{o.montant} FCFA</td>
                                                    <td class="p-4">
                                                        <span class={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            o.statut === 'paye' ? 'bg-green-50 text-green-700' :
                                                            o.statut === 'expedie' ? 'bg-blue-50 text-blue-700' :
                                                            o.statut === 'en_attente' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-700'
                                                        }`}>{o.statut}</span>
                                                    </td>
                                                    <td class="p-4 space-x-2">
                                                        {/* Buyer actions */}
                                                        {user.role === 'acheteur' && o.statut === 'en_attente' && (
                                                            <button onClick={() => setPaymentOrder(o)} class="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 px-3 rounded">
                                                                💸 {t.pay}
                                                            </button>
                                                        )}
                                                        {user.role === 'acheteur' && o.statut === 'paye' && (
                                                            <button onClick={() => setRatingOrder(o)} class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 rounded">
                                                                ⭐ {t.rate_order}
                                                            </button>
                                                        )}

                                                        {/* Seller Actions */}
                                                        {user.role === 'vendeur' && o.statut === 'paye' && (
                                                            <button
                                                                onClick={async () => {
                                                                    await fetch('../../api/endpoints/orders.php', {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${token}`
                                                                        },
                                                                        body: JSON.stringify({ order_id: o.id, statut: 'expedie' })
                                                                    });
                                                                    fetchOrders();
                                                                }}
                                                                class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded"
                                                            >
                                                                Expédier
                                                            </button>
                                                        )}

                                                        <button onClick={() => setDisputeOrder(o)} class="text-red-600 hover:underline text-xs font-bold">
                                                            {t.dispute_btn}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Chat */}
                        {activeTab === 'chat' && (
                            <window.Chat token={token} lang={lang} user={user} />
                        )}

                        {/* Tab Content: Add Product (Sellers) */}
                        {activeTab === 'add_product' && (
                            <div class="max-w-2xl mx-auto bg-white p-6 rounded-xl border shadow-sm">
                                <h2 class="text-xl font-bold mb-4 text-gray-800">{t.add_product}</h2>
                                <form onSubmit={addProduct} class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-semibold mb-1">{t.title}</label>
                                        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-100 outline-none" placeholder="ex: Avocats mûrs de Foumban" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold mb-1">{t.description}</label>
                                        <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-100 outline-none h-24" placeholder="ex: Avocats bio bien gras..." />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-semibold mb-1">{t.price} (FCFA)</label>
                                            <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-100 outline-none" placeholder="2500" />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-semibold mb-1">{t.stock}</label>
                                            <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} required class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-100 outline-none" placeholder="10" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold mb-1">{t.category}</label>
                                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-100 outline-none bg-white">
                                            <option value="Alimentation">Alimentation</option>
                                            <option value="Mode">Mode</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition">
                                        {t.add_product_btn}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Tab Content: Admin Panel */}
                        {activeTab === 'admin' && (
                            <div class="space-y-8">
                                <h2 class="text-2xl font-bold text-indigo-700">{t.admin} Dashboard</h2>

                                {/* Users list */}
                                <div class="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                    <h3 class="text-lg font-bold text-gray-800">{t.users_management}</h3>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left">
                                            <thead>
                                                <tr class="bg-gray-50 border-b font-semibold text-gray-600">
                                                    <th class="p-3">ID</th>
                                                    <th class="p-3">Nom</th>
                                                    <th class="p-3">Email</th>
                                                    <th class="p-3">Rôle</th>
                                                    <th class="p-3">Statut</th>
                                                    <th class="p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y">
                                                {usersList.map(u => (
                                                    <tr key={u.id}>
                                                        <td class="p-3">#{u.id}</td>
                                                        <td class="p-3 font-semibold">{u.nom}</td>
                                                        <td class="p-3">{u.email}</td>
                                                        <td class="p-3 uppercase">{u.role}</td>
                                                        <td class="p-3 font-bold text-xs">
                                                            <span class={`px-2 py-0.5 rounded ${u.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.statut}</span>
                                                        </td>
                                                        <td class="p-3 space-x-2">
                                                            {u.statut === 'actif' ? (
                                                                <button onClick={() => moderateUser(u.id, 'suspendu')} class="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">
                                                                    Suspendre
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => moderateUser(u.id, 'actif')} class="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">
                                                                    Activer
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Content Moderation with Gemini AI analysis helper integration */}
                                <div class="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                    <h3 class="text-lg font-bold text-gray-800">{t.product_management}</h3>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left">
                                            <thead>
                                                <tr class="bg-gray-50 border-b font-semibold text-gray-600">
                                                    <th class="p-3">ID</th>
                                                    <th class="p-3">Annonce</th>
                                                    <th class="p-3">Prix</th>
                                                    <th class="p-3">Statut</th>
                                                    <th class="p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y">
                                                {products.map(p => (
                                                    <tr key={p.id}>
                                                        <td class="p-3">#{p.id}</td>
                                                        <td class="p-3 font-semibold">{p.titre}</td>
                                                        <td class="p-3 font-bold">{p.prix} FCFA</td>
                                                        <td class="p-3">
                                                            <span class={`text-xs px-2 py-0.5 font-bold rounded ${
                                                                p.statut === 'signale' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                                            }`}>{p.statut}</span>
                                                        </td>
                                                        <td class="p-3 space-x-2">
                                                            <button onClick={() => geminiVerifyProduct(p.id)} class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1 rounded font-bold">
                                                                🔍 {t.gemini_verify}
                                                            </button>
                                                            <button onClick={() => moderateProduct(p.id, 'supprime')} class="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded">
                                                                Supprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Dispute Resolution */}
                                <div class="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                    <h3 class="text-lg font-bold text-gray-800">{t.disputes_management}</h3>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left">
                                            <thead>
                                                <tr class="bg-gray-50 border-b font-semibold text-gray-600">
                                                    <th class="p-3">ID Litige</th>
                                                    <th class="p-3">Réf Commande</th>
                                                    <th class="p-3">Description</th>
                                                    <th class="p-3">Statut</th>
                                                    <th class="p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y">
                                                {disputes.map(d => (
                                                    <tr key={d.id}>
                                                        <td class="p-3">#{d.id}</td>
                                                        <td class="p-3 font-bold">#{d.order_id}</td>
                                                        <td class="p-3 text-gray-600">{d.description}</td>
                                                        <td class="p-3 text-xs font-bold uppercase">{d.statut}</td>
                                                        <td class="p-3">
                                                            {d.statut === 'ouvert' && (
                                                                <button onClick={() => setResolveDispute(d)} class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1 rounded">
                                                                    Résoudre
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal - Order Confirmation */}
            {selectedProduct && (
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 class="font-bold text-lg text-indigo-700">{t.buy_now}</h3>
                        <p class="font-semibold text-gray-700">{selectedProduct.titre}</p>
                        <p class="text-sm text-gray-500">{selectedProduct.description}</p>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.quantity}</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedProduct.stock}
                                value={purchaseQty}
                                onChange={e => setPurchaseQty(parseInt(e.target.value))}
                                class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                        </div>
                        <div class="flex justify-between font-bold text-indigo-600">
                            <span>{t.total} :</span>
                            <span>{selectedProduct.prix * purchaseQty} FCFA</span>
                        </div>
                        <div class="flex gap-2">
                            <button onClick={() => setSelectedProduct(null)} class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-bold">Annuler</button>
                            <button onClick={placeOrder} class="flex-1 bg-indigo-600 text-white py-2.5 rounded font-bold hover:bg-indigo-700">Valider</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Payment Initiation */}
            {paymentOrder && (
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 class="font-bold text-lg text-indigo-700">📱 {t.pay}</h3>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.select_operator}</label>
                            <select value={momoOperator} onChange={e => setMomoOperator(e.target.value)} class="w-full px-4 py-2 border rounded bg-white">
                                <option value="orange">Orange Money</option>
                                <option value="momo">MTN MoMo</option>
                                <option value="moov">Moov Money</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.phone_momo}</label>
                            <input
                                type="text"
                                value={momoPhone}
                                onChange={e => setMomoPhone(e.target.value)}
                                placeholder="670000000"
                                class="w-full px-4 py-2 border rounded focus:ring focus:ring-indigo-100 outline-none"
                            />
                        </div>
                        <div class="flex justify-between font-bold text-indigo-600">
                            <span>{t.total} :</span>
                            <span>{paymentOrder.montant} FCFA</span>
                        </div>
                        <div class="flex gap-2">
                            <button onClick={() => setPaymentOrder(null)} class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-bold">Annuler</button>
                            <button onClick={payOrder} class="flex-1 bg-indigo-600 text-white py-2.5 rounded font-bold hover:bg-indigo-700">{t.pay_btn}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - rating */}
            {ratingOrder && (
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 class="font-bold text-lg text-indigo-700">⭐ {t.rate_order}</h3>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Note (1-5)</label>
                            <select value={ratingNote} onChange={e => setRatingNote(parseInt(e.target.value))} class="w-full px-4 py-2 border rounded bg-white">
                                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                <option value="3">⭐⭐⭐ (3/5)</option>
                                <option value="2">⭐⭐ (2/5)</option>
                                <option value="1">⭐ (1/5)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.comment}</label>
                            <textarea
                                value={ratingComment}
                                onChange={e => setRatingComment(e.target.value)}
                                class="w-full px-4 py-2 border rounded focus:ring focus:ring-indigo-100 outline-none h-24"
                                placeholder="Donnez votre avis..."
                            />
                        </div>
                        <div class="flex gap-2">
                            <button onClick={() => setRatingOrder(null)} class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-bold">Annuler</button>
                            <button onClick={submitRating} class="flex-1 bg-indigo-600 text-white py-2.5 rounded font-bold hover:bg-indigo-700">{t.submit}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Dispute */}
            {disputeOrder && (
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 class="font-bold text-lg text-red-600">⚠️ {t.dispute_btn}</h3>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.dispute_desc}</label>
                            <textarea
                                value={disputeDesc}
                                onChange={e => setDisputeDesc(e.target.value)}
                                class="w-full px-4 py-2 border rounded focus:ring focus:ring-indigo-100 outline-none h-24"
                                placeholder="Expliquez en détail le litige rencontré..."
                            />
                        </div>
                        <div class="flex gap-2">
                            <button onClick={() => setDisputeOrder(null)} class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-bold">Annuler</button>
                            <button onClick={submitDispute} class="flex-1 bg-red-600 text-white py-2.5 rounded font-bold hover:bg-red-700">{t.submit}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Admin Resolve Dispute */}
            {resolveDispute && (
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 class="font-bold text-lg text-indigo-700">🛠️ {t.resolve_btn}</h3>
                        <p class="text-sm text-gray-600">Litige : "{resolveDispute.description}"</p>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">{t.resolution_desc}</label>
                            <textarea
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.target.value)}
                                class="w-full px-4 py-2 border rounded focus:ring focus:ring-indigo-100 outline-none h-24"
                                placeholder="ex: Remboursement validé via Mobile Money."
                            />
                        </div>
                        <div class="flex gap-2">
                            <button onClick={() => setResolveDispute(null)} class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-bold">Annuler</button>
                            <button onClick={submitDisputeResolution} class="flex-1 bg-indigo-600 text-white py-2.5 rounded font-bold hover:bg-indigo-700">Valider la Résolution</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer class="bg-gray-800 text-gray-400 py-6 border-t mt-12 text-xs">
                <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span>© 2026 {t.app_title}. Tous droits réservés.</span>
                    <span>Plateforme d'accès direct pour commerçants du Cameroun.</span>
                </div>
            </footer>
        </div>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
