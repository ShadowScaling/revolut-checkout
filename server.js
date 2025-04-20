const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Allow all origins (for dev)
app.use(cors());

// Or, for custom CORS settings:
app.use(cors({
  origin: '*', // Or restrict to a specific domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.post('/api/create-checkout', async (req, res) => {
  const { type } = req.body;

  console.log("🔔 Body brut reçu :", req.body);
  console.log("🔔 Nouvelle requête reçue :", type);
  const userAgent = req.get('User-Agent');
  console.log('User-Agent:', userAgent);
  const amountValue = type === 'avecBump' ? 7400 : 4700;
  const description = type === 'avecBump' ? 'ShadowScaling + Bump' : 'ShadowScaling';

  const payload = {
    amount: amountValue,
    currency: 'EUR',
    description,
    redirect_url: 'https://www.10kchallenge.fr/acces-shadowscaling',
  };

  console.log("📦 Payload envoyé à Revolut :", JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      'https://merchant.revolut.com/api/orders',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Revolut-Api-Version': '2024-09-01'
        }
      }
    );

    console.log("response: ", response);
    const checkout_url = response.data.checkout_url;
    console.log("✅ Checkout URL créée :", checkout_url);
    res.json({ checkout_url });
  } catch (error) {
    console.error('❌ Erreur Revolut :', error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur création du lien Revolut' });
  }
});

app.post('/webhook', express.json(), (req, res) => {
  const event = req.body;

  if (event.event === 'ORDER_COMPLETED') {
    const orderId = event.order_id;
    const externalRef = event.merchant_order_ext_ref;
    console.log(`✅ Paiement confirmé pour la commande : ${orderId} | Ref : ${externalRef}`);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
