/**
 * Zero-build React App / Parent component.
 * Polished with professional modern SaaS layout, custom action modals, and crisp FontAwesome icons.
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

    // Recommendation state powered by Gemini
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
                    photos: ['miel.jpg']
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

    const startChat = (sellerId) => {
        if (!token) {
            alert("Veuillez vous connecter pour envoyer un message.");
            return;
        }
        setActiveTab('chat');
    };

    return (
        <div class="min-h-screen flex flex-col bg-slate-50">
            {/* Header / Navbar */}
            <header class="bg-indigo-900 text-white shadow-md border-b border-indigo-950">
                <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <i class="fa-solid fa-store text-lg"></i>
                        </div>
                        <div>
                            <span class="text-2xl font-black tracking-tight block">{t.app_title}</span>
                            <span class="text-xs text-indigo-200 font-semibold uppercase tracking-wider">{t.tagline}</span>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-4">
                        {/* Language Switcher */}
                        <div class="flex items-center bg-indigo-950 rounded-xl p-1 border border-indigo-800">
                            <button onClick={() => setLang('fr')} class={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${lang === 'fr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-300 hover:text-white'}`}>FR</button>
                            <button onClick={() => setLang('en')} class={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-300 hover:text-white'}`}>EN</button>
                        </div>

                        {/* Low bandwidth control */}
                        <label class="flex items-center gap-2 text-xs bg-indigo-950 hover:bg-indigo-800 transition rounded-xl px-4 py-2.5 cursor-pointer font-bold border border-indigo-800">
                            <input type="checkbox" checked={lowBandwidth} onChange={e => setLowBandwidth(e.target.checked)} class="rounded text-indigo-600 focus:ring-indigo-500 bg-indigo-950 border-indigo-800" />
                            <span>{t.low_bandwidth}</span>
                        </label>

                        {/* User management info */}
                        {user ? (
                            <div class="flex items-center gap-3 bg-indigo-950 px-4 py-2 rounded-xl border border-indigo-800">
                                <span class="text-sm font-bold text-indigo-100 flex items-center gap-2">
                                    <i class="fa-solid fa-circle-user text-indigo-400"></i>
                                    {user.nom} <span class="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full font-semibold">{t[user.role]}</span>
                                </span>
                                <button onClick={handleLogout} class="text-rose-400 hover:text-rose-300 text-xs font-bold pl-3 border-l border-indigo-800 transition">
                                    <i class="fa-solid fa-power-off"></i>
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>

            {/* Role Navigation Dashboard Tabs */}
            {user ? (
                <div class="bg-white border-b shadow-sm sticky top-0 z-30">
                    <div class="max-w-7xl mx-auto px-6 flex overflow-x-auto gap-2">
                        <button onClick={() => setActiveTab('products')} class={`py-4 px-4 font-bold text-sm border-b-4 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            <i class="fa-solid fa-magnifying-glass"></i>
                            {t.search_placeholder.split(' ')[0]}
                        </button>

                        <button onClick={() => setActiveTab('orders')} class={`py-4 px-4 font-bold text-sm border-b-4 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            <i class="fa-solid fa-box-archive"></i>
                            {t.my_orders}
                        </button>

                        <button onClick={() => setActiveTab('chat')} class={`py-4 px-4 font-bold text-sm border-b-4 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            <i class="fa-solid fa-comments"></i>
                            {t.chat}
                        </button>

                        {user.role === 'vendeur' && (
                            <button onClick={() => setActiveTab('add_product')} class={`py-4 px-4 font-bold text-sm border-b-4 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'add_product' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                <i class="fa-solid fa-circle-plus"></i>
                                {t.add_product}
                            </button>
                        )}

                        {user.role === 'admin' && (
                            <button onClick={() => setActiveTab('admin')} class={`py-4 px-4 font-bold text-sm border-b-4 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'admin' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                <i class="fa-solid fa-sliders-up"></i>
                                {t.admin}
                            </button>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Main Container */}
            <main class="flex-1 max-w-7xl w-full mx-auto p-6">
                {!token ? (
                    <window.Login setToken={setToken} setUser={setUser} lang={lang} />
                ) : (
                    <>
                        {/* Tab Content: Products / Search */}
                        {activeTab === 'products' && (
                            <div class="space-y-8">
                                {/* Gemini Smart Recommendation search helper for users */}
                                <div class="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                    <div class="space-y-1">
                                        <h3 class="font-extrabold text-xl text-indigo-900 flex items-center gap-2">
                                            <i class="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
                                            {t.recommended_for_you}
                                        </h3>
                                        <p class="text-sm text-indigo-700 font-medium">Demandez à Gemini de vous aider à dénicher de la nourriture mûre, des épices africaines ou des vêtements...</p>
                                    </div>
                                    <div class="flex w-full md:w-auto gap-2">
                                        <input
                                            type="text"
                                            value={aiQuery}
                                            onChange={e => setAiQuery(e.target.value)}
                                            placeholder="ex: nourriture locale mûre..."
                                            class="px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-200 outline-none w-full md:w-72 text-sm font-semibold shadow-sm"
                                        />
                                        <button onClick={runGeminiAIRecommendation} class="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-3 rounded-xl text-sm transition shadow-md shadow-indigo-100 flex items-center gap-2">
                                            <span>Recommander</span>
                                            <i class="fa-solid fa-bolt"></i>
                                        </button>
                                    </div>
                                </div>

                                {aiRecommendedProducts.length > 0 && (
                                    <div class="space-y-4">
                                        <h4 class="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                            <i class="fa-solid fa-sparkles text-indigo-500"></i>
                                            Trouvés par recommandation IA :
                                        </h4>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            {aiRecommendedProducts.map(p => (
                                                <div key={p.id} class="border border-indigo-100 bg-indigo-50/20 p-4 rounded-xl relative shadow-sm hover:shadow-md transition">
                                                    <span class="absolute top-3 right-3 bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Recommandé</span>
                                                    <h5 class="font-bold text-slate-800 text-base">{p.titre}</h5>
                                                    <p class="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">{p.description}</p>
                                                    <div class="mt-3 flex justify-between items-center">
                                                        <span class="font-extrabold text-sm text-indigo-600">{p.prix} FCFA</span>
                                                        <button onClick={() => setSelectedProduct(p)} class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition">
                                                            {t.buy_now}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ordinary search filters */}
                                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div class="md:col-span-2">
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.search_placeholder.split(' ')[0]}</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <i class="fa-solid fa-magnifying-glass"></i>
                                            </div>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder={t.search_placeholder}
                                                class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.category}</label>
                                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none bg-white text-sm font-semibold text-slate-700">
                                            <option value="">{t.all_categories}</option>
                                            <option value="Alimentation">Alimentation</option>
                                            <option value="Mode">Mode</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.price} Max</label>
                                        <div class="relative">
                                            <input
                                                type="number"
                                                value={priceFilter}
                                                onChange={e => setPriceFilter(e.target.value)}
                                                placeholder="FCFA"
                                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Products Grid */}
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {products.map(p => (
                                        <div key={p.id} class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                                            <div>
                                                {/* Image rendering with lowBandwidth protection */}
                                                {!lowBandwidth ? (
                                                    <div class="h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-400 font-bold gap-2">
                                                        <i class="fa-regular fa-image text-4xl text-slate-300"></i>
                                                        <span class="text-xs uppercase tracking-wider font-semibold text-slate-400">[Mock: {p.titre}]</span>
                                                    </div>
                                                ) : (
                                                    <div class="p-4 text-center bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b">
                                                        <i class="fa-solid fa-image-slash mr-1"></i> {t.low_bandwidth}
                                                    </div>
                                                )}
                                                <div class="p-5 space-y-3">
                                                    <div class="flex justify-between items-center">
                                                        <span class="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">{p.categorie}</span>
                                                        <span class="text-xs text-slate-400 font-bold"><i class="fa-solid fa-cubes text-slate-300 mr-1"></i> {t.stock}: {p.stock}</span>
                                                    </div>
                                                    <h3 class="font-extrabold text-lg text-slate-800 tracking-tight leading-tight">{p.titre}</h3>
                                                    <p class="text-sm text-slate-500 line-clamp-3 font-medium leading-relaxed">{p.description}</p>
                                                    <div class="text-xs text-slate-400 font-bold flex items-center gap-1.5 pt-1">
                                                        <i class="fa-solid fa-user-tie text-slate-300"></i>
                                                        <span>Vendeur : {p.vendeur_nom}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="p-5 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                                <span class="font-black text-xl text-slate-900">{p.prix} <span class="text-xs text-indigo-600 font-extrabold">FCFA</span></span>
                                                <div class="flex gap-2">
                                                    <button onClick={() => startChat(p.vendeur_id)} class="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                                                        <i class="fa-regular fa-comment-dots text-slate-400"></i>
                                                        <span>{t.chat}</span>
                                                    </button>
                                                    {user.role === 'acheteur' && (
                                                        <button onClick={() => setSelectedProduct(p)} class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-1.5">
                                                            <i class="fa-solid fa-basket-shopping"></i>
                                                            <span>{t.buy_now}</span>
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
                                <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                                    <i class="fa-solid fa-receipt text-indigo-600"></i>
                                    {t.my_orders}
                                </h2>
                                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <table class="w-full border-collapse">
                                        <thead>
                                            <tr class="bg-slate-50/70 text-left border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                <th class="p-4 pl-6">ID</th>
                                                <th class="p-4">Produit</th>
                                                <th class="p-4">{t.quantity}</th>
                                                <th class="p-4">{t.total}</th>
                                                <th class="p-4">Statut</th>
                                                <th class="p-4 pr-6">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100 text-sm">
                                            {orders.map(o => (
                                                <tr key={o.id} class="hover:bg-slate-50/50 transition">
                                                    <td class="p-4 pl-6 font-bold text-indigo-600">#{o.id}</td>
                                                    <td class="p-4 font-bold text-slate-800">{o.produit_titre}</td>
                                                    <td class="p-4 text-slate-500 font-bold">{o.quantite}</td>
                                                    <td class="p-4 font-black text-slate-800">{o.montant} FCFA</td>
                                                    <td class="p-4">
                                                        <span class={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                            o.statut === 'paye' ? 'bg-emerald-50 text-emerald-700' :
                                                            o.statut === 'expedie' ? 'bg-blue-50 text-blue-700' :
                                                            o.statut === 'en_attente' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
                                                        }`}>{o.statut}</span>
                                                    </td>
                                                    <td class="p-4 pr-6 space-x-2">
                                                        {user.role === 'acheteur' && o.statut === 'en_attente' && (
                                                            <button onClick={() => setPaymentOrder(o)} class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl transition inline-flex items-center gap-1.5">
                                                                <i class="fa-solid fa-wallet"></i>
                                                                <span>{t.pay}</span>
                                                            </button>
                                                        )}
                                                        {user.role === 'acheteur' && o.statut === 'paye' && (
                                                            <button onClick={() => setRatingOrder(o)} class="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl transition inline-flex items-center gap-1.5">
                                                                <i class="fa-regular fa-star"></i>
                                                                <span>{t.rate_order}</span>
                                                            </button>
                                                        )}

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
                                                                class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl transition inline-flex items-center gap-1.5"
                                                            >
                                                                <i class="fa-solid fa-truck-ramp-box"></i>
                                                                <span>Expédier</span>
                                                            </button>
                                                        )}

                                                        <button onClick={() => setDisputeOrder(o)} class="text-rose-600 hover:text-rose-800 text-xs font-bold transition inline-flex items-center gap-1">
                                                            <i class="fa-solid fa-circle-info"></i>
                                                            <span>{t.dispute_btn}</span>
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
                            <div class="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-md">
                                <h2 class="text-2xl font-black mb-6 text-slate-800 flex items-center gap-2">
                                    <i class="fa-solid fa-circle-plus text-indigo-600"></i>
                                    {t.add_product}
                                </h2>
                                <form onSubmit={addProduct} class="space-y-5">
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t.title}</label>
                                        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold" placeholder="ex: Avocats mûrs de Foumban" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t.description}</label>
                                        <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none h-28 text-sm font-semibold" placeholder="ex: Avocats bio bien gras..." />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t.price} (FCFA)</label>
                                            <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold" placeholder="2500" />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t.stock}</label>
                                            <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold" placeholder="10" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t.category}</label>
                                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none bg-white text-sm font-semibold text-slate-700">
                                            <option value="Alimentation">Alimentation</option>
                                            <option value="Mode">Mode</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-paper-plane text-sm"></i>
                                        <span>{t.add_product_btn}</span>
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Tab Content: Admin Panel */}
                        {activeTab === 'admin' && (
                            <div class="space-y-8">
                                <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                                    <i class="fa-solid fa-gears text-indigo-600"></i>
                                    {t.admin} Control Panel
                                </h2>

                                {/* Users list */}
                                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h3 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <i class="fa-solid fa-users text-indigo-500"></i>
                                        {t.users_management}
                                    </h3>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left">
                                            <thead>
                                                <tr class="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-xs">
                                                    <th class="p-3 pl-4">ID</th>
                                                    <th class="p-3">Nom</th>
                                                    <th class="p-3">Email</th>
                                                    <th class="p-3">Rôle</th>
                                                    <th class="p-3">Statut</th>
                                                    <th class="p-3 pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-100 font-medium">
                                                {usersList.map(u => (
                                                    <tr key={u.id}>
                                                        <td class="p-3 pl-4 font-bold text-indigo-600">#{u.id}</td>
                                                        <td class="p-3 font-bold text-slate-800">{u.nom}</td>
                                                        <td class="p-3 text-slate-500">{u.email}</td>
                                                        <td class="p-3 uppercase text-xs font-extrabold text-indigo-600">{u.role}</td>
                                                        <td class="p-3 font-bold text-xs">
                                                            <span class={`px-2.5 py-1 rounded-full ${u.statut === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{u.statut}</span>
                                                        </td>
                                                        <td class="p-3 pr-4 space-x-2">
                                                            {u.statut === 'actif' ? (
                                                                <button onClick={() => moderateUser(u.id, 'suspendu')} class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-xl transition">
                                                                    Suspendre
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => moderateUser(u.id, 'actif')} class="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl transition">
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

                                {/* Content Moderation with Gemini AI */}
                                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h3 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <i class="fa-solid fa-shield-halved text-indigo-500"></i>
                                        {t.product_management}
                                    </h3>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left">
                                            <thead>
                                                <tr class="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-xs">
                                                    <th class="p-3 pl-4">ID</th>
                                                    <th class="p-3">Annonce</th>
                                                    <th class="p-3">Prix</th>
                                                    <th class="p-3">Statut</th>
                                                    <th class="p-3 pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-100 font-medium">
                                                {products.map(p => (
                                                    <tr key={p.id}>
                                                        <td class="p-3 pl-4 font-bold text-indigo-600">#{p.id}</td>
                                                        <td class="p-3 font-bold text-slate-800">{p.titre}</td>
                                                        <td class="p-3 font-black text-slate-700">{p.prix} FCFA</td>
                                                        <td class="p-3">
                                                            <span class={`text-xs px-2.5 py-1 font-bold rounded-full ${
                                                                p.statut === 'signale' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                                            }`}>{p.statut}</span>
                                                        </td>
                                                        <td class="p-3 pr-4 space-x-2">
                                                            <button onClick={() => geminiVerifyProduct(p.id)} class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1">
                                                                <i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                                                                <span>{t.gemini_verify}</span>
                                                            </button>
                                                            <button onClick={() => moderateProduct(p.id, 'supprime')} class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-xl transition">
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
                                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h3 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <i class="fa-solid fa-scale-balanced text-indigo-500"></i>
                                        {t.disputes_management}
                                    </h3>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left">
                                            <thead>
                                                <tr class="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-xs">
                                                    <th class="p-3 pl-4">ID Litige</th>
                                                    <th class="p-3">Réf Commande</th>
                                                    <th class="p-3">Description</th>
                                                    <th class="p-3">Statut</th>
                                                    <th class="p-3 pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-100 font-medium">
                                                {disputes.map(d => (
                                                    <tr key={d.id}>
                                                        <td class="p-3 pl-4 font-bold text-indigo-600">#{d.id}</td>
                                                        <td class="p-3 font-bold">#{d.order_id}</td>
                                                        <td class="p-3 text-slate-500 max-w-xs truncate">{d.description}</td>
                                                        <td class="p-3 text-xs font-extrabold uppercase text-slate-700">{d.statut}</td>
                                                        <td class="p-3 pr-4">
                                                            {d.statut === 'ouvert' && (
                                                                <button onClick={() => setResolveDispute(d)} class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
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
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
                        <h3 class="font-extrabold text-xl text-slate-950 flex items-center gap-2">
                            <i class="fa-solid fa-basket-shopping text-indigo-600"></i>
                            {t.buy_now}
                        </h3>
                        <p class="font-extrabold text-slate-800 text-lg leading-tight">{selectedProduct.titre}</p>
                        <p class="text-sm text-slate-500 font-semibold">{selectedProduct.description}</p>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t.quantity}</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedProduct.stock}
                                value={purchaseQty}
                                onChange={e => setPurchaseQty(parseInt(e.target.value))}
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold text-slate-800"
                            />
                        </div>
                        <div class="flex justify-between font-black text-indigo-600 text-lg pt-1 border-t border-slate-100">
                            <span>{t.total} :</span>
                            <span>{selectedProduct.prix * purchaseQty} FCFA</span>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onClick={() => setSelectedProduct(null)} class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition text-sm">Annuler</button>
                            <button onClick={placeOrder} class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-extrabold hover:bg-indigo-700 transition text-sm shadow-md shadow-indigo-100">Valider</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Payment Initiation */}
            {paymentOrder && (
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
                        <h3 class="font-extrabold text-xl text-slate-950 flex items-center gap-2">
                            <i class="fa-solid fa-mobile-screen-button text-indigo-600"></i>
                            {t.pay}
                        </h3>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t.select_operator}</label>
                            <select value={momoOperator} onChange={e => setMomoOperator(e.target.value)} class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none">
                                <option value="orange">Orange Money</option>
                                <option value="momo">MTN MoMo</option>
                                <option value="moov">Moov Money</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t.phone_momo}</label>
                            <input
                                type="text"
                                value={momoPhone}
                                onChange={e => setMomoPhone(e.target.value)}
                                placeholder="670000000"
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold text-slate-800"
                            />
                        </div>
                        <div class="flex justify-between font-black text-indigo-600 text-lg pt-1 border-t border-slate-100">
                            <span>{t.total} :</span>
                            <span>{paymentOrder.montant} FCFA</span>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onClick={() => setPaymentOrder(null)} class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition text-sm">Annuler</button>
                            <button onClick={payOrder} class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-extrabold hover:bg-indigo-700 transition text-sm shadow-md shadow-indigo-100">{t.pay_btn}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - rating */}
            {ratingOrder && (
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
                        <h3 class="font-extrabold text-xl text-slate-950 flex items-center gap-2">
                            <i class="fa-regular fa-star text-indigo-600"></i>
                            {t.rate_order}
                        </h3>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Note (1-5)</label>
                            <select value={ratingNote} onChange={e => setRatingNote(parseInt(e.target.value))} class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none">
                                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                <option value="3">⭐⭐⭐ (3/5)</option>
                                <option value="2">⭐⭐ (2/5)</option>
                                <option value="1">⭐ (1/5)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t.comment}</label>
                            <textarea
                                value={ratingComment}
                                onChange={e => setRatingComment(e.target.value)}
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none h-24 text-sm font-semibold"
                                placeholder="Donnez votre avis..."
                            />
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onClick={() => setRatingOrder(null)} class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition text-sm">Annuler</button>
                            <button onClick={submitRating} class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-extrabold hover:bg-indigo-700 transition text-sm shadow-md shadow-indigo-100">{t.submit}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Dispute */}
            {disputeOrder && (
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
                        <h3 class="font-extrabold text-xl text-rose-600 flex items-center gap-2">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            {t.dispute_btn}
                        </h3>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t.dispute_desc}</label>
                            <textarea
                                value={disputeDesc}
                                onChange={e => setDisputeDesc(e.target.value)}
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none h-24 text-sm font-semibold"
                                placeholder="Expliquez en détail le litige rencontré..."
                            />
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onClick={() => setDisputeOrder(null)} class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition text-sm">Annuler</button>
                            <button onClick={submitDispute} class="flex-1 bg-rose-600 text-white py-3 rounded-xl font-extrabold hover:bg-rose-700 transition text-sm shadow-md shadow-rose-100">{t.submit}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Admin Resolve Dispute */}
            {resolveDispute && (
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
                        <h3 class="font-extrabold text-xl text-slate-950 flex items-center gap-2">
                            <i class="fa-solid fa-scale-balanced text-indigo-600"></i>
                            {t.resolve_btn}
                        </h3>
                        <p class="text-sm text-slate-600 font-medium">Litige : "{resolveDispute.description}"</p>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t.resolution_desc}</label>
                            <textarea
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.target.value)}
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none h-24 text-sm font-semibold"
                                placeholder="ex: Remboursement validé via Mobile Money."
                            />
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onClick={() => setResolveDispute(null)} class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition text-sm">Annuler</button>
                            <button onClick={submitDisputeResolution} class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-extrabold hover:bg-indigo-700 transition text-sm shadow-md shadow-indigo-100">Valider la Résolution</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer class="bg-indigo-950 text-indigo-300 py-8 border-t border-indigo-900 mt-16 text-xs font-semibold">
                <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span>© 2026 {t.app_title}. Tous droits réservés.</span>
                    <span class="text-indigo-400">Plateforme d'accès direct pour commerçants du Cameroun.</span>
                </div>
            </footer>
        </div>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
