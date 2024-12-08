---
import type { APIRoute } from 'astro';
import stripe from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export const post: APIRoute = async ({ request }) => {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // معالجة الدفع الناجح
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // إضافة الدورة للمستخدم
      await supabase.from('user_courses').insert({
        user_id: session.client_reference_id,
        course_id: session.metadata.course_id,
        purchased_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Webhook Error' }),
      { status: 400 }
    );
  }
};