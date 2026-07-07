import { useState, useCallback } from 'react';

// Production admin app — source of truth for order/production data; this
// app only confirms what happened. NOTE: belarro-v4.vercel.app is a DEAD
// domain (DEPLOYMENT_NOT_FOUND) even though older code references it.
const BELARRO_BASE = 'https://admin.belarro.com';
const SYNC_SECRET = import.meta.env.VITE_SALETRACKER_SYNC_SECRET || '';

function ymdLocal(d) {
  return d.toLocaleDateString('sv'); // YYYY-MM-DD in local tz
}

// Next Tuesday on/after `from` (deliveries always go out on Tuesday).
function nextTuesday(from) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
  return d;
}

export function useDeliveries() {
  const [customers, setCustomers] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [date, setDate] = useState(() => ymdLocal(nextTuesday(new Date())));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDue = useCallback(async (forDate) => {
    const targetDate = forDate || date;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BELARRO_BASE}/api/deliveries/due?date=${targetDate}`, {
        headers: { 'x-sync-secret': SYNC_SECRET },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load deliveries');
      setCustomers(json.data || []);
      setUpcoming(json.upcoming || []);
      setDate(json.date || targetDate);
    } catch (err) {
      console.error('useDeliveries fetchDue error:', err);
      setError(err.message);
      setCustomers([]);
      setUpcoming([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  // status: 'delivered' | 'adjusted' | 'not_delivered'
  const confirm = useCallback(async ({ orderId, status, actualQty, note, confirmedBy }) => {
    const res = await fetch(`${BELARRO_BASE}/api/deliveries/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sync-secret': SYNC_SECRET },
      body: JSON.stringify({
        order_id: orderId,
        delivery_date: date,
        status,
        actual_qty: actualQty,
        note,
        confirmed_by: confirmedBy,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to confirm delivery');
    await fetchDue(date);
    return json.data;
  }, [date, fetchDue]);

  const goToPreviousTuesday = useCallback(() => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() - 7);
    fetchDue(ymdLocal(d));
  }, [date, fetchDue]);

  const goToNextTuesday = useCallback(() => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + 7);
    fetchDue(ymdLocal(d));
  }, [date, fetchDue]);

  return { customers, upcoming, date, loading, error, fetchDue, confirm, goToPreviousTuesday, goToNextTuesday };
}
