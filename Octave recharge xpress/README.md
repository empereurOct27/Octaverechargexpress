# Recharge Express — Serveur de confirmation de paiement

Cet espace de travail contient un petit frontend statique (`index.html`, `style.css`, `script.js`) et un serveur Node.js minimal pour enregistrer les transactions et notifier le propriétaire via WhatsApp lorsque le client confirme le paiement.

Démarrage rapide

1. Copiez `.env.example` en `.env` et renseignez vos identifiants Twilio (optionnel).
2. Installez les dépendances :

```bash
npm install
```

3. Démarrez le serveur :

```bash
npm start
```

4. Déployez le site sur Netlify.
5. Ouvrez la page déployée et cliquez sur `Payer via Wave`. Le flux ouvrira Wave et la page `confirm.html`.
6. Après le paiement sur Wave, le payeur doit cliquer sur "J'ai payé" sur la page de confirmation pour déclencher l'envoi du message WhatsApp via la fonction Netlify.

Remarques
- En production, utilisez une base de données persistante et sécurisez vos points de terminaison.
- Twilio est utilisé pour envoyer les messages WhatsApp ; si Twilio n'est pas configuré, la fonction Netlify logge le message côté serveur.
- Le code client est visible dans le navigateur par défaut; impossible de cacher le JavaScript avec F12. Vous pouvez minifier ou optimiser mais pas rendre le frontend totalement invisible.
