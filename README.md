# Culina (Vite migration)

Commandes
- Installer deps: `npm install`
- Développement: `npm run dev` (http://localhost:5173)
- Build de production: `npm run build` (sortie dans `dist`)
- Preview du build: `npm run preview`

Notes importantes
- J'ai modifié le code pour éviter que du TypeScript non transpilé empêche le rendu.
- L'appel à `@google/genai` est chargé dynamiquement et s'il n'est pas disponible côté navigateur l'utilisateur verra une alerte — l'utilisation recommandée est d'appeler GoogleGenAI depuis un backend sécurisé (la clé API ne doit pas être exposée au client).
- Sur Vercel, mettre `Build Command` : `npm run build` et `Output Directory` : `dist`.
- Tu peux définir une variable d'environnement `VITE_API_KEY` dans Vercel si tu veux tester côté client (non recommandé en production).
