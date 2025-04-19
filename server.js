const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/create-checkout', async (req, res) => {
  try {
    const response = await axios.post(
      'https://merchant.revolut.com/api/1.0/orders',
      {
        amount: 4700,
        currency: 'EUR',
        capture_mode: 'AUTOMATIC',
        merchant_order_ext_ref: `order_${Date.now()}`,
        description: 'Pack ShadowScaling',
        redirect_url: {
          success: 'https://10kchallenge.fr/upsell',
          failure: 'https://10kchallenge.fr/echec'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REVOLUT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const checkout_id = response.data.checkout_id;
    res.json({ checkout_id });
  } catch (err) {
    console.error('Erreur Revolut:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Erreur lors de la création du paiement.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
