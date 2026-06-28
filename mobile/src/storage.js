// mobile/src/storage.js
// Mock AsyncStorage for offline-first approach as per memory

const mockStorage = {
    data: {},
    setItem: async (key, value) => {
        mockStorage.data[key] = value;
    },
    getItem: async (key) => {
        return mockStorage.data[key] || null;
    }
};

export const saveChatLocally = async (chat) => {
    const existing = await mockStorage.getItem('offline_chats') || '[]';
    const chats = JSON.parse(existing);
    chats.push(chat);
    await mockStorage.setItem('offline_chats', JSON.stringify(chats));
};

export const getOfflineChats = async () => {
    const chats = await mockStorage.getItem('offline_chats') || '[]';
    return JSON.parse(chats);
};
