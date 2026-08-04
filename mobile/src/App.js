import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Login from './screens/Login';
import Chat from './screens/Chat';
import { translations } from './translations';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('fr');
  const [isOffline, setIsOffline] = useState(false);

  // Offline Sync Queue list
  const [syncQueue, setSyncQueue] = useState([]);

  // Active tab inside mobile app: products, chat, orders
  const [activeTab, setActiveTab] = useState('products');

  const t = translations[lang];

  const handleLogin = (userData) => {
    setUser(userData);
    setToken('mock-jwt-token');
  };

  const handleQueueAction = (action) => {
    setSyncQueue([...syncQueue, action]);
  };

  const syncOfflineQueue = () => {
    if (syncQueue.length === 0) {
      alert("Aucune action en file d'attente.");
      return;
    }
    // Perform simulated upload sync
    alert(`Synchronisation réussie de ${syncQueue.length} actions en arrière-plan !`);
    setSyncQueue([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.tagline}</Text>
        </View>

        <View style={styles.controls}>
          {/* Language Selector toggles */}
          <View style={styles.langSelector}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'fr' ? styles.langActive : styles.langInactive]}
              onPress={() => setLang('fr')}
            >
              <Text style={[styles.langText, lang === 'fr' ? styles.textActive : styles.textInactive]}>FR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' ? styles.langActive : styles.langInactive]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langText, lang === 'en' ? styles.textActive : styles.textInactive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Offline Banner & Synchronizer Trigger */}
      <View style={[styles.offlineBanner, isOffline ? styles.bgOffline : styles.bgOnline]}>
        <Text style={styles.offlineText}>
          {isOffline ? t.offline_notice : "Connecté au réseau local"}
        </Text>
        <View style={styles.row}>
          <Text style={styles.switchLabel}>Offline Mode : </Text>
          <Switch value={isOffline} onValueChange={setIsOffline} />
          {isOffline && syncQueue.length > 0 && (
            <TouchableOpacity style={styles.syncBtn} onPress={syncOfflineQueue}>
              <Text style={styles.syncBtnText}>{t.sync_btn} ({syncQueue.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.body}>
        {!token ? (
          <Login onLogin={handleLogin} lang={lang} t={t} />
        ) : (
          <View style={styles.content}>
            {/* Tab navigation */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'products' && styles.activeTab]}
                onPress={() => setActiveTab('products')}
              >
                <Text style={styles.tabText}>{t.products}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
                onPress={() => setActiveTab('chat')}
              >
                <Text style={styles.tabText}>{t.chat}</Text>
              </TouchableOpacity>
            </View>

            {/* Tab screens */}
            {activeTab === 'products' ? (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t.products}</Text>

                {/* Product listing mock */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Plantains du Moungo</Text>
                  <Text style={styles.cardPrice}>4,500 FCFA</Text>
                  <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyBtnText}>{t.pay}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Miel Sauvage d'Obala</Text>
                  <Text style={styles.cardPrice}>6,000 FCFA</Text>
                  <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyBtnText}>{t.pay}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <Chat user={user} t={t} isOffline={isOffline} onQueueAction={handleQueueAction} />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: '#4338CA',
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  langActive: {
    backgroundColor: '#FFF',
  },
  langInactive: {
    backgroundColor: 'transparent',
  },
  langText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textActive: {
    color: '#4F46E5',
  },
  textInactive: {
    color: '#FFF',
  },
  offlineBanner: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bgOffline: {
    backgroundColor: '#FEF3C7',
  },
  bgOnline: {
    backgroundColor: '#D1FAE5',
  },
  offlineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
  syncBtn: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  syncBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 18, // Accessibility Standard Min Font Size
    fontWeight: 'bold',
    color: '#374151',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20, // Accessibility Standard Padding >= 15px
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20, // Accessibility Standard >= 18px
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buyBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 15, // Accessibility Standard Padding >= 15px
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#FFF',
    fontSize: 18, // Accessibility Standard FontSize >= 18px
    fontWeight: 'bold',
  }
});
