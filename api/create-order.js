// POST /api/create-order
// Body: { amount: number (paise), label?: string }
// Returns the Razorpay order object the frontend needs to open checkout.
//
// This mirrors the create-order function already deployed on
// mentorship.arpansarkar.org — copy verbatim into new subdomain apps.

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, label } = req.body || {};

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return res.status(400).json({ error: 'amount must be an integer >= 100 (paise)' });
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { label: label || 'arpansarkar.org purchase' },
    });
    return res.status(200).json(order);
  } catch (err) {
    console.error('create-order error', err);
    return res.status(500).json({ error: 'Could not create order' });
  }
}
