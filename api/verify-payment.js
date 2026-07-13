// POST /api/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Verifies the HMAC signature Razorpay returns, then flips the matching
// `pending` purchase rows (created in create-order.js) to `paid`. This is
// the ONLY place a purchase ever becomes `paid` — the client can never
// write that status itself (see protect_purchase_columns trigger).

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not signed in.' });

    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid session — please sign in again.' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment fields.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature.' });
    }

    const { data: purchases, error: updateErr } = await supabaseAdmin
      .from('purchases')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .select();
    if (updateErr) throw updateErr;

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ error: 'No matching pending order found for this payment.' });
    }

    res.status(200).json({ success: true, purchases });
  } catch (err) {
    console.error('[verify-payment] failed:', err);
    res.status(500).json({ error: 'Could not verify payment.' });
  }
}
