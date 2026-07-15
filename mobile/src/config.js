import { Platform } from 'react-native';

export const API_BASE = Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/endpoints'
    : 'http://localhost:8000/api/endpoints';

export const translations = {
    fr: {
        login: "Connexion",
        register: "S'inscrire",
        username: "Nom d'utilisateur",
        password: "Mot de passe",
        selectExam: "Choisir un examen",
        selectSubject: "Choisir une matière",
        typeMessage: "Tapez votre question...",
        send: "Envoyer",
        logout: "Déconnexion"
    },
    en: {
        login: "Login",
        register: "Register",
        username: "Username",
        password: "Password",
        selectExam: "Select Exam",
        selectSubject: "Select Subject",
        typeMessage: "Type your question...",
        send: "Send",
        logout: "Logout"
    }
};
