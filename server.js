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
        customer_email: 'test@example.com' // optionnel
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

  // Vérifie que l'événement reçu est bien un paiement réussi
  if (event.event === 'ORDER_COMPLETED') {
    const orderId = event.order_id;
    const externalRef = event.merchant_order_ext_ref;

    console.log(`✅ Paiement confirmé pour la commande : ${orderId} | Ref : ${externalRef}`);

    // ICI TU PEUX FAIRE CE QUE TU VEUX :
    // - enregistrer l'utilisateur dans une base
    // - envoyer un email de confirmation
    // - ou notifier côté frontend une redirection personnalisée
  }

  res.sendStatus(200); // Toujours répondre 200 pour confirmer à Revolut que le webhook a été bien reçu
});
