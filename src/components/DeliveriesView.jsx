// ============================================
// DELIVERIES VIEW — confirm what actually went out this Tuesday
// ============================================
// Pulls "what's due" from belarro-v4 (production/order schedule) and lets
// the driver confirm each crop line per customer as Delivered / Adjust qty /
// Not delivered. Confirming writes an immutable row to belarro_v4_delivery —
// this is the ground truth invoices read for past dates, decoupled from
// whatever the live order config says today.

import { useState } from 'react';

function fmtDate(ymd) {
  return new Date(`${ymd}T00:00:00`).toLocaleDateString('en-DE', { weekday: 'long', day: 'numeric', month: 'short' });
}

const STATUS_STYLE = {
  pending: { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', label: 'Pending' },
  delivered: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: 'Delivered' },
  adjusted: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', label: 'Adjusted' },
  not_delivered: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Not delivered' },
};

const DeliveryLine = ({ item, onConfirm, confirming }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const [qty, setQty] = useState(item.expected_qty);
  const status = STATUS_STYLE[item.status] || STATUS_STYLE.pending;

  return (
    <div style={{
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-main)' }}>
            {item.crop_name}{item.size_name ? ` (${item.size_name})` : ''}
            {item.is_ending && (
              <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 700, color: '#F59E0B' }}>ENDING</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Expected: {item.expected_qty}
            {item.status !== 'pending' && item.actual_qty !== item.expected_qty && ` · Actual: ${item.actual_qty}`}
          </div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
          background: status.bg, color: status.color, whiteSpace: 'nowrap',
        }}>
          {status.label}
        </span>
      </div>

      {!showAdjust ? (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: '13px', padding: '8px' }}
            disabled={confirming}
            onClick={() => onConfirm({ status: 'delivered', actualQty: item.expected_qty })}
          >
            ✓ Delivered
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: '13px', padding: '8px' }}
            disabled={confirming}
            onClick={() => { setQty(item.expected_qty); setShowAdjust(true); }}
          >
            Adjust
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: '13px', padding: '8px', color: '#EF4444' }}
            disabled={confirming}
            onClick={() => onConfirm({ status: 'not_delivered', actualQty: 0 })}
          >
            ✕ Not delivered
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{
              width: '64px', padding: '8px', borderRadius: '8px',
              border: '1px solid var(--color-border)', textAlign: 'center', fontSize: '14px',
            }}
          />
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: '13px', padding: '8px' }}
            disabled={confirming}
            onClick={() => { onConfirm({ status: 'adjusted', actualQty: Number(qty) }); setShowAdjust(false); }}
          >
            Save
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '8px 12px' }}
            onClick={() => setShowAdjust(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const CustomerCard = ({ customer, onConfirmLine, confirmingId }) => {
  const allDone = customer.items.every(i => i.status !== 'pending');
  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-border)',
      marginBottom: 'var(--spacing-sm)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: allDone ? 'rgba(16,185,129,0.08)' : 'transparent',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-main)' }}>
            {customer.customer_name}
          </div>
          {customer.address && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{customer.address}</div>
          )}
        </div>
        {allDone && <span style={{ fontSize: '18px' }}>✅</span>}
      </div>
      {customer.items.map(item => (
        <DeliveryLine
          key={item.order_id}
          item={item}
          confirming={confirmingId === item.order_id}
          onConfirm={(payload) => onConfirmLine(customer.customer_id, item.order_id, payload)}
        />
      ))}
    </div>
  );
};

const DeliveriesView = ({ user, deliveries }) => {
  const { customers, date, loading, error, confirm, goToPreviousTuesday, goToNextTuesday } = deliveries;
  const [confirmingId, setConfirmingId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleConfirm = async (customerId, orderId, { status, actualQty }) => {
    setConfirmingId(orderId);
    try {
      await confirm({ orderId, status, actualQty, confirmedBy: user?.email });
      setToast(status === 'not_delivered' ? 'Marked as not delivered' : 'Confirmed');
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setToast(`Failed: ${err.message}`);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setConfirmingId(null);
    }
  };

  const totalItems = customers.reduce((s, c) => s + c.items.length, 0);
  const doneItems = customers.reduce((s, c) => s + c.items.filter(i => i.status !== 'pending').length, 0);

  return (
    <div style={{ padding: 'var(--spacing-md)', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
        <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={goToPreviousTuesday}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-main)' }}>{fmtDate(date)}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {doneItems}/{totalItems} confirmed
          </div>
        </div>
        <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={goToNextTuesday}>→</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>{error}</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
          No deliveries due this day.
        </div>
      ) : (
        customers.map(c => (
          <CustomerCard key={c.customer_id} customer={c} onConfirmLine={handleConfirm} confirmingId={confirmingId} />
        ))
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
