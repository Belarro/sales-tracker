import { useState } from 'react';
import { useFollowUps } from '../hooks/useFollowUps.js';
import { supabase } from '../utils/supabaseClient.js';

const STAGE_LABELS = {
  1: 'Message 1 · 2h',
  2: 'Message 2 · 2d',
  3: 'Message 3 · 5d',
  4: 'Message 4 · 2w',
  5: 'Message 5 · 1m',
};

const REENGAGE_LABELS = {
  1: 'Re-engage',
  2: 'Follow-up · 5d',
  3: 'Easy Yes · 2w',
  4: 'Open Door · 1m',
};

function isLandline(phone) {
  if (!phone) return false;
  const d = phone.replace(/[\s\-\+\(\)]/g, '');
  return /^4930/.test(d) || /^030/.test(d) || /^0[2-9]/.test(d);
}

function buildWaLink(phone, text) {
  if (!phone) return null;
  let p = phone.replace(/[\s\-().]/g, '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.startsWith('0')) p = '49' + p.slice(1);
  for (const c of ['972','44','43','49','1']) {
    if (p.startsWith(c + c)) { p = p.slice(c.length); break; }
  }
  for (const c of ['972','44','43','49','1']) {
    if (p.startsWith(c) && p[c.length] === '0') { p = c + p.slice(c.length + 1); break; }
  }
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(text)}` : null;
}

// Message templates matching Belarro admin
const CHEF_PAGE = 'https://belarro.com/for-chefs';

function buildMessage(stage, flow, loc) {
  const name = loc.contact_person || loc.location_name || 'there';
  const isDE = (loc.language || '').toUpperCase() !== 'EN'; // default DE

  const msgs = {
    new: {
      1: isDE
        ? `Hallo ${name},\n\nvielen Dank für Ihre Zeit heute, es war eine Freude Sie kennenzulernen.\n\nHier ist der Link zu unseren Sorten und Preisen:\n\n${CHEF_PAGE}\n\nIch würde mich freuen zu hören, was Sie denken. Zur Erinnerung: keine Lieferkosten, keine Mindestbestellung.\n\nGenießen Sie den Rest Ihres Abends.\nRon von Belarro`
        : `Hello ${name},\n\nThank you for your time today; it was a pleasure meeting you.\n\nHere is the link for our varieties and pricing:\n\n${CHEF_PAGE}\n\nI would love to hear what you think. Just a reminder: no delivery fees, no minimum order.\n\nEnjoy the rest of your service.\nRon from Belarro`,
      2: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Ich hoffe, Sie hatten die Gelegenheit, die Proben zu probieren und zu sehen, wie sie zu Ihren Gerichten passen.\n\nWir wachsen nur, was Sie bestellen, kein alter Bestand, kein Abfall. Wir ernten am Morgen der Lieferung und unsere Microgreens bleiben bis zu 10 Tage frisch im Kühlschrank.\n\nLassen Sie mich wissen, was Ihr Interesse geweckt hat, und ich nehme es in den nächsten Anbauzyklus auf.\n\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. I hope you had the chance to taste the samples and see how they work with your dishes.\n\nWe only grow what you order, no old stock, zero waste. We harvest the morning of delivery, and our greens last up to 10 days in the fridge.\n\nLet me know what caught your eye and I will get it into the next grow cycle.\n\nRon from Belarro`,
      3: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Ich wollte nachfragen, wie Ihnen unsere Microgreens gefallen haben.\n\nWir bauen über 25 Sorten an, mehr Auswahl als die meisten Lieferanten, mehr Möglichkeiten für Ihre Teller. Bestellungen sind wiederkehrend: einmal bestellen, jeden Dienstag frisch erhalten. Sie können jederzeit ändern, hinzufügen oder stornieren.\n\nHier ist die vollständige Liste:\n\n${CHEF_PAGE}\n\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. Wanted to follow up and see how you found our greens.\n\nWe grow over 25 varieties, more variety than most suppliers, more options for your plates. Orders are recurring: order once, receive fresh every Tuesday. You can always change, add or cancel.\n\nHere is the full list:\n\n${CHEF_PAGE}\n\nRon from Belarro`,
      4: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Ich habe noch nichts gehört und wollte kurz nachfragen.\n\nWir sind lokal. Keine Importe, schnelleres und konsistenteres Produkt, einfach frische Microgreens mit weniger Emissionen.\n\nKeine Mindestbestellung, keine Lieferkosten. Sagen Sie mir einfach, wann Sie bereit sind.\n\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. Haven't heard back, just wanted to check in.\n\nWe are local. No imports, faster, more consistent product, just fresh greens with less emissions.\n\nNo minimums, no delivery fees. Just let me know when you are ready.\n\nRon from Belarro`,
      5: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Kein Problem, wenn der Zeitpunkt nicht gepasst hat.\n\nWann immer Sie frische Microgreens benötigen, wir sind eine Nachricht entfernt. Keine Mindestbestellung, kostenlose Lieferung, geerntet am Morgen der Lieferung.\n\nUnsere Sorten und Preise finden Sie hier:\n\n${CHEF_PAGE}\n\nWir wünschen Ihnen eine großartige Saison.\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. No worries if the timing wasn't right.\n\nWhenever you need fresh microgreens, we are one message away. No minimums, free delivery, harvested the morning we bring them to you.\n\nOur varieties and pricing are always here:\n\n${CHEF_PAGE}\n\nWishing you a great season.\nRon from Belarro`,
    },
    reengage: {
      1: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Ich war vor einiger Zeit bei ${loc.location_name} und möchte mich nun richtig melden.\n\nWir haben unser Sortiment stark erweitert. Wir bauen jetzt über 25 Sorten Microgreens an, alle am Morgen der Lieferung geerntet.\n\nJeden Dienstag. Keine Lieferkosten. Keine Mindestbestellung.\n\nSoll ich Ihnen unsere aktuelle Preisliste schicken?\n\nRon von Belarro`
        : `Hi ${name}, Ron from Belarro. I stopped by ${loc.location_name} a while back and we are finally following up properly.\n\nWe have expanded significantly. We now grow 25+ varieties of microgreens, all harvested the morning of delivery.\n\nEvery Tuesday. No delivery fees. No minimum order.\n\nWant me to send over our current price list?\n\nRon from Belarro`,
      2: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Ich wollte kurz nachhaken.\n\nWir bauen über 25 Sorten an. Einmal bestellen, jede Woche frisch erhalten. Jederzeit änderbar. Keine Mindestbestellung, keine Lieferkosten.\n\nWenn Sie bereit sind, sind wir eine Nachricht entfernt.\n\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. Just following up on my last message.\n\nWe grow over 25 varieties. Order once and receive fresh every week. You can always change, add or cancel. No minimums, no delivery fees.\n\nWhenever you are ready, we are one message away.\n\nRon from Belarro`,
      3: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Ich habe noch nichts gehört und wollte kurz nachfragen.\n\nWir sind lokal. Keine Importe, schnelleres und konsistenteres Produkt.\n\nKeine Mindestbestellung, keine Lieferkosten. Sagen Sie mir einfach, wann Sie bereit sind.\n\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. Haven't heard back, just wanted to check in.\n\nWe are local. No imports, faster, more consistent product.\n\nNo minimums, no delivery fees. Just let me know when you are ready.\n\nRon from Belarro`,
      4: isDE
        ? `Hallo ${name},\n\nRon von Belarro. Kein Problem, wenn der Zeitpunkt nicht gepasst hat.\n\nWann immer Sie frische Microgreens benötigen, wir sind eine Nachricht entfernt.\n\n${CHEF_PAGE}\n\nWir wünschen Ihnen eine großartige Saison.\nRon von Belarro`
        : `Hello ${name},\n\nRon from Belarro. No worries if the timing wasn't right.\n\nWhenever you need fresh microgreens, we are one message away.\n\n${CHEF_PAGE}\n\nWishing you a great season.\nRon from Belarro`,
    }
  };

  return (msgs[flow] || msgs.new)[stage] || '';
}

function FollowUpCard({ f, onMarkSent, onRefresh, locked = false }) {
  const loc = f.loc || {};
  const phone = loc.direct_phone || loc.business_phone || null;
  const email = loc.direct_email || null;
  const landline = isLandline(phone);
  const hasWA = !!phone && !landline;
  const flow = f.flow || 'new';
  const totalStages = flow === 'reengage' ? 4 : 5;
  const stageLabels = flow === 'reengage' ? REENGAGE_LABELS : STAGE_LABELS;
  const isOverdue = new Date(f.due_date) < new Date();

  const [sentChannels, setSentChannels] = useState(new Set());
  const [confirmVia, setConfirmVia] = useState(null);
  const [showMsg, setShowMsg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [snoozeDays, setSnoozeDays] = useState(90);
  const [actioning, setActioning] = useState(false);

  const msg = buildMessage(f.stage, flow, loc);
  const waLink = hasWA ? buildWaLink(phone, msg) : null;

  const handleSendWA = () => {
    if (waLink) window.open(waLink, '_blank');
    setConfirmVia('whatsapp');
  };

  const EMAIL_SUBJECTS_DE = { 1: 'Belarro Microgreens - Nach unserem Gespraech heute', 2: 'Belarro Microgreens - Kurze Nachfrage', 3: 'Belarro Microgreens - Noch interessiert?', 4: 'Belarro Microgreens - Letzte Nachricht von uns', 5: 'Belarro Microgreens - Wir melden uns ein letztes Mal' };
  const EMAIL_SUBJECTS_EN = { 1: 'Belarro Microgreens - Following our conversation today', 2: 'Belarro Microgreens - Quick follow-up', 3: 'Belarro Microgreens - Still interested?', 4: 'Belarro Microgreens - One last message', 5: 'Belarro Microgreens - Final note from us' };

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailError(null);
    try {
      const isDE = (loc.language || '').toUpperCase() !== 'EN'; // default DE
      const subjects = isDE ? EMAIL_SUBJECTS_DE : EMAIL_SUBJECTS_EN;
      const subject = subjects[f.stage] || 'Belarro Microgreens';
      const res = await fetch('https://frontend-six-beryl-91.vercel.app/api/send-followup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followup_id: f.id,
          to: email,
          subject,
          body: msg,
          language: loc.language || 'EN',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSentChannels(prev => new Set([...prev, 'email']));
      } else {
        setEmailError(json.error || 'Send failed');
      }
    } catch {
      setEmailError('Network error');
    } finally {
      setSendingEmail(false);
    }
  };

  const confirmSent = (via) => {
    setSentChannels(prev => new Set([...prev, via]));
    setConfirmVia(null);
  };

  const handleDone = async () => {
    setSubmitting(true);
    const via = Array.from(sentChannels).join('+');
    await onMarkSent(f.id, via);
    setSubmitting(false);
  };

  const handleCommunicated = async () => {
    setActioning(true);
    await supabase.from('belarro_v4_follow_up').update({ status: 'replied', updated_at: new Date().toISOString() }).eq('id', f.id);
    setActioning(false);
    onRefresh();
  };

  const handleSnooze = async () => {
    setActioning(true);
    const wake = new Date();
    wake.setDate(wake.getDate() + snoozeDays);
    await supabase.from('belarro_v4_follow_up')
      .update({ due_date: wake.toISOString(), updated_at: new Date().toISOString() })
      .eq('location_id', f.location_id).eq('status', 'pending');
    setActioning(false);
    setShowSnooze(false);
    onRefresh();
  };

  const handleConverted = async () => {
    setActioning(true);
    await supabase.from('locations').update({ pipeline_stage: 'active', updated_at: new Date().toISOString() }).eq('id', f.location_id);
    await supabase.from('belarro_v4_follow_up').update({ status: 'skipped', updated_at: new Date().toISOString() }).eq('location_id', f.location_id).eq('status', 'pending');
    setActioning(false);
    onRefresh();
  };

  const anySent = sentChannels.size > 0;
  const waSent = sentChannels.has('whatsapp');
  const emailSent = sentChannels.has('email');

  return (
    <div style={{
      background: 'var(--color-bg-main)',
      border: `1px solid ${isOverdue ? '#fca5a5' : 'var(--color-border)'}`,
      borderLeft: `3px solid ${isOverdue ? '#ef4444' : '#10b981'}`,
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--spacing-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', color: 'var(--color-text-main)' }}>
            {loc.location_name}
          </div>
          {loc.contact_person && (
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {loc.contact_person}
            </div>
          )}
        </div>
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '2px 8px',
          borderRadius: 'var(--border-radius-full)',
          background: flow === 'reengage' ? '#fef3c7' : '#ede9fe',
          color: flow === 'reengage' ? '#92400e' : '#5b21b6',
          whiteSpace: 'nowrap', flexShrink: 0
        }}>
          {flow === 'reengage' ? 'Re-engage' : 'Lead'} {f.stage}/{totalStages}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: totalStages }, (_, i) => i + 1).map(s => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '100%', height: '4px', borderRadius: '2px',
              background: s < f.stage ? '#10b981' : s === f.stage ? '#ef4444' : '#e5e7eb',
              animation: s === f.stage ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: '600' }}>
              {stageLabels[s]?.split('·')[1]?.trim() || s}
            </span>
          </div>
        ))}
      </div>

      {/* Contact + due */}
      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {phone && <div>{landline ? '📞' : '💬'} {phone}</div>}
        {email && <div>📧 {email}</div>}
        <div style={{ fontWeight: '600', color: isOverdue ? '#ef4444' : 'var(--color-text-main)' }}>
          Due: {new Date(f.due_date).toLocaleDateString('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          {isOverdue && ' — Overdue'}
        </div>
        {loc.sales_rep && <div>👤 {loc.sales_rep}</div>}
      </div>

      {/* Message preview toggle */}
      <button
        onClick={() => setShowMsg(!showMsg)}
        style={{
          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm)', padding: '6px 10px',
          fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'left', cursor: 'pointer'
        }}
      >
        {showMsg ? '▲ Hide message' : '▼ Preview message'}
      </button>
      {showMsg && (
        <div style={{
          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm)', padding: '10px',
          fontSize: '12px', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.5'
        }}>
          {msg}
        </div>
      )}

      {/* Send buttons */}
      {locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', background: '#f9fafb', borderRadius: 'var(--border-radius-sm)', border: '1px solid #e5e7eb' }}>
            🔒 Unlocks {new Date(f.due_date).toLocaleDateString('en-DE', { day: 'numeric', month: 'short' })}
          </div>
          {email && (
            <button onClick={handleSendEmail} disabled={sendingEmail}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-sm)', border: 'none', background: emailSent ? '#eff6ff' : sendingEmail ? '#93c5fd' : '#2563eb', color: emailSent ? '#2563eb' : 'white', fontWeight: '700', fontSize: '13px', cursor: sendingEmail ? 'default' : 'pointer' }}>
              {emailSent ? '✓ Email' : sendingEmail ? 'Sending...' : '📧 Send Email Anyway'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasWA && (
            <button onClick={handleSendWA}
              style={{ flex: 1, padding: '10px', borderRadius: 'var(--border-radius-sm)', border: waSent ? '1px solid #10b981' : 'none', background: waSent ? '#f0fdf4' : '#16a34a', color: waSent ? '#16a34a' : 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {waSent ? '✓ WhatsApp' : '💬 WhatsApp'}
            </button>
          )}
          {email && (
            <button onClick={handleSendEmail} disabled={sendingEmail}
              style={{ flex: 1, padding: '10px', borderRadius: 'var(--border-radius-sm)', border: emailSent ? '1px solid #2563eb' : 'none', background: emailSent ? '#eff6ff' : sendingEmail ? '#93c5fd' : '#2563eb', color: emailSent ? '#2563eb' : 'white', fontWeight: '700', fontSize: '13px', cursor: sendingEmail ? 'default' : 'pointer' }}>
              {emailSent ? '✓ Email' : sendingEmail ? 'Sending...' : '📧 Email'}
            </button>
          )}
          {!hasWA && !email && (
            <button onClick={() => { setShowMsg(true); navigator.clipboard?.writeText(msg); }}
              style={{ flex: 1, padding: '10px', borderRadius: 'var(--border-radius-sm)', background: '#4b5563', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
              📋 Copy Message
            </button>
          )}
        </div>
      )}
      {emailError && (
        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>{emailError}</div>
      )}

      {/* Done button — appears after any channel sent */}
      {anySent && (
        <button
          onClick={handleDone}
          disabled={submitting}
          style={{
            width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)',
            background: submitting ? '#86efac' : '#10b981', color: 'white',
            fontWeight: '700', fontSize: '14px', cursor: submitting ? 'default' : 'pointer', border: 'none'
          }}
        >
          {submitting ? 'Saving...' : '✓ Done — move to next stage'}
        </button>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={handleCommunicated} disabled={actioning}
          style={{ flex: 1, padding: '8px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid #fcd34d', background: '#fefce8', color: '#92400e', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>
          💬 Communicated
        </button>
        <button onClick={() => setShowSnooze(true)} disabled={actioning}
          style={{ flex: 1, padding: '8px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid #fcd34d', background: '#fffbeb', color: '#92400e', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>
          Snooze
        </button>
        <button onClick={handleConverted} disabled={actioning}
          style={{ flex: 1, padding: '8px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>
          Converted
        </button>
      </div>

      {/* Snooze picker */}
      {showSnooze && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 'var(--border-radius-sm)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Snooze for how long?</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[30, 60, 90].map(d => (
              <button key={d} onClick={() => setSnoozeDays(d)}
                style={{ flex: 1, padding: '6px', borderRadius: 'var(--border-radius-sm)', border: `1px solid ${snoozeDays === d ? '#f59e0b' : '#e5e7eb'}`, background: snoozeDays === d ? '#f59e0b' : 'white', color: snoozeDays === d ? 'white' : '#374151', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                {d}d
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setShowSnooze(false)}
              style={{ flex: 1, padding: '8px', borderRadius: 'var(--border-radius-sm)', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSnooze} disabled={actioning}
              style={{ flex: 1, padding: '8px', borderRadius: 'var(--border-radius-sm)', border: 'none', background: '#f59e0b', color: 'white', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
              {actioning ? '...' : `Snooze ${snoozeDays}d`}
            </button>
          </div>
        </div>
      )}

      {/* Did you send it? confirm */}
      {confirmVia && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px'
        }}>
          <div style={{
            background: 'var(--color-bg-main)', borderRadius: 'var(--border-radius-md)',
            padding: '24px', maxWidth: '320px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px', color: 'var(--color-text-main)' }}>
              Did you send it?
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              {confirmVia === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'} opened for <strong>{loc.location_name}</strong>. Confirm only if you actually sent it.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmVia(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--border-radius-sm)',
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text-main)'
                }}
              >
                No
              </button>
              <button
                onClick={() => confirmSent(confirmVia)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--border-radius-sm)',
                  background: '#10b981', border: 'none',
                  color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                }}
              >
                Yes, Sent!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FollowUpsView = () => {
  const { today, upcoming, warm, loading, error, refetch, markSent } = useFollowUps();
  const [activeTab, setActiveTab] = useState('today');

  const tabs = [
    { key: 'today', label: `Today (${today.length})`, urgent: today.length > 0 },
    { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
    { key: 'warm', label: `Warm (${warm.length})`, urgent: warm.length > 0 },
  ];

  const displayed = activeTab === 'today' ? today : activeTab === 'upcoming' ? upcoming : warm;

  return (
    <div style={{ padding: 'var(--spacing-md)', paddingBottom: '80px', height: '100%', overflowY: 'auto', background: 'var(--color-bg-secondary)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)', fontWeight: '700' }}>
          Follow-ups
        </h2>
        <button onClick={refetch} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '16px', gap: '0' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1, padding: '10px 4px', fontSize: '12px', fontWeight: '700',
              border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: activeTab === t.key ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === t.key ? '#10b981' : t.urgent ? '#ef4444' : '#6b7280',
              marginBottom: '-2px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', fontSize: '13px' }}>Error: {error}</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{activeTab === 'today' ? '✓' : '—'}</div>
          <div style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
            {activeTab === 'today' ? 'All caught up!' : activeTab === 'upcoming' ? 'No upcoming follow-ups.' : 'No warm leads.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {displayed.map(f => (
            <FollowUpCard key={f.id} f={f} onMarkSent={markSent} onRefresh={refetch} locked={activeTab === 'upcoming'} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUpsView;
