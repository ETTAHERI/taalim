import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface Props {
  courseId: string;
  price: number;
  title: string;
}

export default function CheckoutButton({ courseId, price, title }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          price,
          title,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await loadStripe(import.meta.env.PUBLIC_STRIPE_KEY);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'جاري التحويل...' : 'اشترك الآن'}
    </button>
  );
}