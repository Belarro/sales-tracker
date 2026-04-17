// ============================================
// BELARRO FOLLOW-UP MESSAGE TEMPLATES
// ============================================
// Premium / chef-level messaging.
// Short, direct, professional. No fluff.
// WhatsApp + Email templates for each stage.

const BASE_LINK_EN = 'https://belarro.com/for-chefs';
const BASE_LINK_DE = 'https://belarro.com/de/for-chefs';

function priceLink(base, loc) {
  const params = new URLSearchParams();
  if (loc.locationName) params.set('r', loc.locationName);
  if (loc.contactPerson) params.set('p', loc.contactPerson);
  if (loc.contactTitle) params.set('t', loc.contactTitle);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * All follow-up templates keyed by stage.
 * Each returns { body, emailBody, emailSubject, nextStage, nextActionDays, nextActionType }
 */
export const FOLLOW_UP_TEMPLATES = {

  // ──────────────────────────────────────────
  // MESSAGE 1 — 2-Hour Follow-Up (The Link)
  // ──────────────────────────────────────────
  new_visit: {
    EN: (loc) => ({
      body: [
        `Hello ${loc.contactPerson},`,
        `Thank you for your time today; it was a pleasure meeting you.`,
        `Here is the link for our varieties and pricing: ${priceLink(BASE_LINK_EN, loc)}`,
        `I would love to hear what you think. Just a reminder: no delivery fees, no minimum order.`,
        `Enjoy the rest of your service.\nRon from Belarro`
      ].join('\n\n'),
      emailSubject: 'Belarro — Varieties & Pricing',
      emailBody: [
        `Hello ${loc.contactPerson},`,
        `Thank you for your time today; it was a pleasure meeting you.`,
        `Here is the link for our varieties and pricing:\n${priceLink(BASE_LINK_EN, loc)}`,
        `No delivery fees, no minimum order.`,
        `Enjoy the rest of your service.\nRon from Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_1',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hallo ${loc.contactPerson},`,
        `vielen Dank für deine Zeit heute, hat mich gefreut dich kennenzulernen.`,
        `Hier ist der Link zu unseren Sorten und Preisen: ${priceLink(BASE_LINK_DE, loc)}`,
        `Ich bin gespannt auf dein Feedback. Nur zur Erinnerung: keine Lieferkosten, kein Mindestbestellwert.`,
        `Viel Erfolg im Service.\nRon von Belarro`
      ].join('\n\n'),
      emailSubject: 'Belarro — Sorten & Preise',
      emailBody: [
        `Hallo ${loc.contactPerson},`,
        `vielen Dank für deine Zeit heute, hat mich gefreut dich kennenzulernen.`,
        `Hier ist der Link zu unseren Sorten und Preisen:\n${priceLink(BASE_LINK_DE, loc)}`,
        `Keine Lieferkosten, kein Mindestbestellwert.`,
        `Viel Erfolg im Service.\nRon von Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_1',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // MESSAGE 2 — 2-Day Follow-Up (The Taste)
  // ──────────────────────────────────────────
  follow_up_1: {
    EN: (loc) => ({
      body: [
        `Hello ${loc.contactPerson},`,
        `Ron from Belarro. I hope you had the chance to taste the samples and see how they work with your dishes.`,
        `We only grow what you order — no old stock, zero waste. We harvest the morning of delivery, and our greens last up to 10 days in the fridge.`,
        `Let me know what caught your eye and I'll get it into the next grow cycle.\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — How did the samples work?',
      emailBody: [
        `Hello ${loc.contactPerson},`,
        `I hope you had the chance to taste the samples and see how they work with your dishes.`,
        `We only grow what you order — no old stock, zero waste. Harvested the morning of delivery, up to 10 days shelf life.`,
        `Let me know what caught your eye.\nRon from Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_2',
      nextActionDays: 3,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hallo ${loc.contactPerson},`,
        `Ron von Belarro hier. Ich hoffe, du konntest die Samples testen und sehen, wie sie zu deinen Gerichten passen.`,
        `Wir bauen nur das an, was du bestellst – kein Lager, kein alter Bestand, null Verschwendung. Wir ernten am Morgen der Lieferung, und unsere Greens halten bis zu 10 Tage im Kühlschrank.`,
        `Sag mir einfach, was dir gefallen hat, dann plane ich es für den nächsten Grow ein.\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — Wie haben die Samples funktioniert?',
      emailBody: [
        `Hallo ${loc.contactPerson},`,
        `Ich hoffe, du konntest die Samples testen und sehen, wie sie zu deinen Gerichten passen.`,
        `Wir bauen nur das an, was du bestellst – kein Lager, null Verschwendung. Ernte am Morgen der Lieferung, bis zu 10 Tage haltbar.`,
        `Sag mir einfach, was dir gefallen hat.\nRon von Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_2',
      nextActionDays: 3,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // MESSAGE 3 — 5-Day Follow-Up (The Facts)
  // ──────────────────────────────────────────
  follow_up_2: {
    EN: (loc) => ({
      body: [
        `Hello ${loc.contactPerson},`,
        `Ron from Belarro. Wanted to follow up and see how you found our greens.`,
        `We grow over 25 varieties — more variety than most suppliers, more options for your plates. Orders are recurring: order once, receive fresh every Tuesday. You can always change, add or cancel.`,
        `Here's the full list: ${priceLink(BASE_LINK_EN, loc)}\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — 25+ varieties',
      emailBody: [
        `Hello ${loc.contactPerson},`,
        `Wanted to follow up and see how you found our greens.`,
        `We grow over 25 varieties — more options for your plates. Order once, receive fresh every Tuesday. Change, add or cancel anytime.`,
        `Full list: ${priceLink(BASE_LINK_EN, loc)}\nRon from Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_3',
      nextActionDays: 9,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hallo ${loc.contactPerson},`,
        `Ron von Belarro hier. Wollte kurz nachfragen, wie dir unsere Greens gefallen haben.`,
        `Wir bauen über 25 Sorten an – mehr Auswahl als bei den meisten Anbietern, mehr Möglichkeiten für deine Teller. Bestellungen laufen automatisch: einmal bestellen, jede Woche frisch am Dienstag geliefert. Du kannst jederzeit ändern, hinzufügen oder pausieren.`,
        `Hier ist die komplette Liste: ${priceLink(BASE_LINK_DE, loc)}\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — Über 25 Sorten',
      emailBody: [
        `Hallo ${loc.contactPerson},`,
        `Wollte kurz nachfragen, wie dir unsere Greens gefallen haben.`,
        `Über 25 Sorten – mehr Auswahl, mehr Möglichkeiten. Einmal bestellen, jeden Dienstag frisch. Jederzeit änderbar.`,
        `Komplette Liste: ${priceLink(BASE_LINK_DE, loc)}\nRon von Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_3',
      nextActionDays: 9,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // MESSAGE 4 — 2-Week Follow-Up (The Easy Yes)
  // ──────────────────────────────────────────
  follow_up_3: {
    EN: (loc) => ({
      body: [
        `Hello ${loc.contactPerson},`,
        `Ron from Belarro. Haven't heard back, just wanted to check in.`,
        `We're local, no imports — faster, more consistent product, just fresh greens with less emissions.`,
        `No minimums, no pressure. Just let me know when you're ready.\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — Checking in',
      emailBody: [
        `Hello ${loc.contactPerson},`,
        `Haven't heard back, just wanted to check in.`,
        `Local, no imports — consistent quality, less emissions. No minimums, no pressure.`,
        `Let me know when you're ready.\nRon from Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_4',
      nextActionDays: 16,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hallo ${loc.contactPerson},`,
        `Ron von Belarro hier. Wollte kurz nachhaken, habe nichts mehr von dir gehört.`,
        `Wir sind lokal, keine Importe – dadurch schneller und konstanter in der Qualität. Einfach frische Greens mit weniger Emissionen.`,
        `Kein Mindestbestellwert, kein Druck. Meld dich, wenn es für dich passt.\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — Kurze Nachfrage',
      emailBody: [
        `Hallo ${loc.contactPerson},`,
        `Wollte kurz nachhaken, habe nichts mehr von dir gehört.`,
        `Lokal, keine Importe – konstante Qualität, weniger Emissionen. Kein Mindestbestellwert, kein Druck.`,
        `Meld dich, wenn es für dich passt.\nRon von Belarro`
      ].join('\n\n'),
      nextStage: 'follow_up_4',
      nextActionDays: 16,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // MESSAGE 5 — 1-Month Follow-Up (The Open Door)
  // ──────────────────────────────────────────
  follow_up_4: {
    EN: (loc) => ({
      body: [
        `Hello ${loc.contactPerson},`,
        `Ron from Belarro. No worries if the timing wasn't right.`,
        `Whenever you need fresh microgreens, we're one message away. No minimums, free delivery, harvested the morning we bring them to you.`,
        `Our varieties and pricing are always here: ${priceLink(BASE_LINK_EN, loc)}`,
        `Wishing you a great season.\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — Here when you need us',
      emailBody: [
        `Hello ${loc.contactPerson},`,
        `No worries if the timing wasn't right.`,
        `Whenever you need fresh microgreens, we're one message away. No minimums, free delivery, harvested fresh.`,
        `Varieties & pricing: ${priceLink(BASE_LINK_EN, loc)}`,
        `Wishing you a great season.\nRon from Belarro`
      ].join('\n\n'),
      nextStage: 'inactive',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: [
        `Hallo ${loc.contactPerson},`,
        `Ron von Belarro hier. Kein Problem, wenn es zeitlich nicht gepasst hat.`,
        `Wenn du frische Microgreens brauchst, sind wir nur eine Nachricht entfernt. Kein Mindestbestellwert, kostenlose Lieferung, am Morgen der Lieferung geerntet.`,
        `Unsere Sorten und Preise findest du hier: ${priceLink(BASE_LINK_DE, loc)}`,
        `Ich wünsche dir eine starke Saison.\nRon`
      ].join('\n\n'),
      emailSubject: 'Belarro — Da wenn du uns brauchst',
      emailBody: [
        `Hallo ${loc.contactPerson},`,
        `Kein Problem, wenn es zeitlich nicht gepasst hat.`,
        `Wenn du frische Microgreens brauchst, sind wir nur eine Nachricht entfernt. Kein Mindestbestellwert, kostenlose Lieferung, frisch geerntet.`,
        `Sorten & Preise: ${priceLink(BASE_LINK_DE, loc)}`,
        `Starke Saison!\nRon von Belarro`
      ].join('\n\n'),
      nextStage: 'inactive',
      nextActionDays: null,
      nextActionType: null
    })
  },

  // ──────────────────────────────────────────
  // ORDER CONFIRMED
  // ──────────────────────────────────────────
  order_confirmed: {
    EN: (loc, user, extra) => {
      const deliveryISO = extra?.deliveryDate || '';
      const deliveryD = deliveryISO ? new Date(deliveryISO + 'T00:00:00') : null;
      const dateStr = deliveryD
        ? deliveryD.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        : '[delivery date]';
      const monday = deliveryD ? new Date(deliveryD) : null;
      if (monday) monday.setDate(monday.getDate() - 1);
      return {
        body: [
          `Confirmed.`,
          `First delivery: ${dateStr}.`,
          `You will receive the same every Tuesday.`,
          `Adjustments can be made anytime.`
        ].join('\n\n'),
        nextStage: 'delivery_reminder',
        nextActionDays: null,
        nextActionType: 'whatsapp',
        _nextActionDate: monday,
        _deliveryDate: deliveryISO,
        _needsDeliveryDate: true,
      };
    },
    DE: (loc, user, extra) => {
      const deliveryISO = extra?.deliveryDate || '';
      const deliveryD = deliveryISO ? new Date(deliveryISO + 'T00:00:00') : null;
      const dateStr = deliveryD
        ? deliveryD.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
        : '[Lieferdatum]';
      const monday = deliveryD ? new Date(deliveryD) : null;
      if (monday) monday.setDate(monday.getDate() - 1);
      return {
        body: [
          `Bestaetigt.`,
          `Erste Lieferung: ${dateStr}.`,
          `Du bekommst jeden Dienstag das gleiche.`,
          `Aenderungen sind jederzeit moeglich.`
        ].join('\n\n'),
        nextStage: 'delivery_reminder',
        nextActionDays: null,
        nextActionType: 'whatsapp',
        _nextActionDate: monday,
        _deliveryDate: deliveryISO,
        _needsDeliveryDate: true,
      };
    }
  },

  // ──────────────────────────────────────────
  // MONDAY REMINDER — day before first delivery
  // ──────────────────────────────────────────
  delivery_reminder: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `First delivery tomorrow.`
      ].join('\n\n'),
      nextStage: 'post_delivery',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Erste Lieferung morgen.`
      ].join('\n\n'),
      nextStage: 'post_delivery',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // POST DELIVERY — Wednesday after delivery
  // ──────────────────────────────────────────
  post_delivery: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Did everything perform as expected?`,
        `Let me know what you want to adjust.`
      ].join('\n\n'),
      emailSubject: 'Feedback',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Did everything perform as expected?`,
        `I can adjust anything for the next delivery.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'active_customer',
      nextActionDays: 42,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Hat alles wie erwartet funktioniert?`,
        `Sag mir was du anpassen willst.`
      ].join('\n\n'),
      emailSubject: 'Feedback',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Hat alles wie erwartet funktioniert?`,
        `Ich kann alles fuer die naechste Lieferung anpassen.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'active_customer',
      nextActionDays: 42,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // ACTIVE CUSTOMER — 6 week check-in
  // ──────────────────────────────────────────
  active_customer: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Is everything running as it should?`,
        `We can refine or introduce something new if needed.`
      ].join('\n\n'),
      nextStage: 'active_customer',
      nextActionDays: 42,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Laeuft alles wie es soll?`,
        `Wir koennen anpassen oder was Neues einbauen wenn du willst.`
      ].join('\n\n'),
      nextStage: 'active_customer',
      nextActionDays: 42,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // INACTIVE — no orders for a while
  // ──────────────────────────────────────────
  inactive: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Is everything running as it should?`,
        `We can refine or introduce something new if needed.`
      ].join('\n\n'),
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Laeuft alles wie es soll?`,
        `Wir koennen anpassen oder was Neues einbauen wenn du willst.`
      ].join('\n\n'),
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    })
  }
};

/**
 * Get the follow-up message for a location based on its current pipeline stage.
 */
export function getFollowUpMessage(location, userName, extra) {
  const stage = location.pipelineStage || 'new_visit';
  const lang = (location.language || 'DE').toUpperCase();
  const template = FOLLOW_UP_TEMPLATES[stage];

  if (!template) return null;

  const langTemplate = template[lang] || template['DE'];
  const result = langTemplate(location, userName, extra);

  // Build WhatsApp deep link
  let phone = (location.directPhone || location.businessPhone || '')
    .replace(/[\s\-().]/g, '')
    .replace(/[^0-9+]/g, '')
    .replace(/^\+/, '');
  // Handle 00-prefix international format (e.g. 0049...)
  if (phone.startsWith('00')) phone = phone.slice(2);
  // Handle local 0-prefix (e.g. German 0159... → 49159...)
  if (phone.startsWith('0')) phone = '49' + phone.slice(1);
  // De-duplicate country code (e.g. 4949... → 49...)
  for (const code of ['972', '44', '43', '49', '1']) {
    if (phone.startsWith(code + code)) { phone = phone.slice(code.length); break; }
  }
  // Strip extra 0 after country code (e.g. +49(0)159... → 49159...)
  for (const code of ['972', '44', '43', '49', '1']) {
    if (phone.startsWith(code) && phone[code.length] === '0') {
      phone = code + phone.slice(code.length + 1);
      break;
    }
  }
  const encodedText = phone ? encodeURIComponent(result.body) : '';
  const waLink = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}` : null;

  return { ...result, waLink, phone, stage, lang };
}

/**
 * Get human-readable label for a pipeline stage
 */
export function getStageLabel(stage) {
  const labels = {
    new_visit: 'Message 1 — The Link (2h)',
    follow_up_1: 'Message 2 — The Taste (2 days)',
    follow_up_2: 'Message 3 — The Facts (5 days)',
    follow_up_3: 'Message 4 — The Easy Yes (2 weeks)',
    follow_up_4: 'Message 5 — The Open Door (1 month)',
    order_confirmed: 'Order confirmed',
    delivery_reminder: 'Delivery tomorrow',
    post_delivery: 'Post-delivery feedback',
    active_customer: '6-week check-in',
    inactive: 'Inactive',
    closed_won: 'Active customer',
    closed_lost: 'Closed'
  };
  return labels[stage] || stage;
}
