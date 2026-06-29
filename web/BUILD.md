### Développement Web

L'application web est structurée pour utiliser React.

#### Installation
```bash
cd web
npm install
```

#### Production Build
Pour préparer l'application pour la production :
1. Installez un bundler comme Vite : `npm install -D vite`
2. Configurez `vite.config.js` pour pointer vers `web/src/index.js`.
3. Lancez `npx vite build`.
4. Déployez le contenu du dossier `dist/` sur votre serveur web.

#### Mode Démo (Runtime Babel)
Pour visualiser rapidement sans build tool (non recommandé en production) :
- Utilisez `web/public/index.html` qui charge Babel standalone.
