const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/create-checkout', async (req, res) => {
  const { type } = req.body;

  const amount = type === 'avecBump' ? 7400 : 4700;
  const description = type === 'avecBump' ? 'ShadowScaling + Bump' : 'ShadowScaling';

  try {
    const response = await axios.post(
      'https://merchant.revolut.com/api/checkout-link',
      {
        amount,
        currency: 'EUR',
        description,
        capture_mode: 'AUTOMATIC',
        country: 'FR',
        customer_email: 'test@example.com',
        complete_url: 'https://www.10kchallenge.fr/shadow-scaling',  // ✅ Redirection après paiement
        cancel_url: 'https://www.10kchallenge.fr/shadow-scalingbondecommande'  // 🔙 Redirection si annulation
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REVOLUT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ checkout_url: response.data.checkout_url });
  } catch (error) {
    console.error('Erreur Revolut :', error.response?.data || error.message);
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
