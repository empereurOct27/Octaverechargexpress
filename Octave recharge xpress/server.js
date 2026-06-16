require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());
// Servir les fichiers statiques (frontend) depuis le dossier racine
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;

const TW_CLIENT = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const OWNER_WHATSAPP_TO = process.env.OWNER_WHATSAPP_TO || 'whatsapp:+2250584921917';

// In-memory storage (for demo). Replace with a real DB for production.
const transactions = new Map();

app.post('/create-transaction', (req, res) => {
  const { service, phone, montant, operateur } = req.body || {};
  if (!service || !phone || !montant) return res.status(400).json({ error: 'missing_fields' });
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  transactions.set(id, { service, phone, montant, operateur, paid: false, createdAt: Date.now() });
  const confirmUrl = `${req.protocol}://${req.get('host')}/confirm/${id}`;
  res.json({ id, confirmUrl });
});

app.get('/confirm/:id', (req, res) => {
  const tx = transactions.get(req.params.id);
  if (!tx) return res.status(404).send('Transaction introuvable');
  res.send(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirmer paiement</title><style>body{font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;color:#111} .card{max-width:480px;margin:40px auto;background:#fff;padding:20px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.08)} button{display:inline-block;padding:12px 16px;border-radius:8px;border:none;background:#25d366;color:#fff;font-weight:700;cursor:pointer}</style></head><body><div class="card"><h2>Paiement ${tx.montant} FCFA</h2><p><strong>Opérateur:</strong> ${tx.operateur}</p><p><strong>Service:</strong> ${tx.service}</p><p><strong>Numéro:</strong> ${tx.phone}</p><p style="color:#666">Après avoir effectué le paiement sur Wave, cliquez sur "J'ai payé" pour signaler la réception.</p><button id="paid">J'ai payé</button><div id="resp" style="margin-top:12px;color:green"></div></div><script>document.getElementById('paid').addEventListener('click',function(){fetch('/confirm/${req.params.id}/paid',{method:'POST'}).then(r=>r.json()).then(j=>{document.getElementById('resp').textContent=j.message}).catch(e=>{document.getElementById('resp').textContent='Erreur'});});</script></body></html>`);
});

app.post('/confirm/:id/paid', async (req, res) => {
  const tx = transactions.get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'not_found' });
  if (tx.paid) return res.json({ message: 'Déjà confirmé' });
  tx.paid = true;
  tx.paidAt = Date.now();

  const body = `NOUVEAU PAIEMENT RECU\nOperateur: ${tx.operateur}\nService: ${tx.service}\nNumero: ${tx.phone}\nMontant: ${tx.montant} FCFA`;

  if (!TW_CLIENT) {
    console.warn('Twilio non configuré. Affichage en console.');
    console.log('WhatsApp message to send:', body);
    return res.json({ message: "Confirmation enregistrée (Twilio non configuré)." });
  }

  try {
    await TW_CLIENT.messages.create({
      from: WHATSAPP_FROM,
      to: OWNER_WHATSAPP_TO,
      body
    });
    return res.json({ message: 'Confirmation envoyée par WhatsApp.' });
  } catch (err) {
    console.error('Twilio error', err);
    return res.status(500).json({ error: 'twilio_error' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
