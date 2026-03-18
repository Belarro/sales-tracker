// ============================================
// BELARRO FOLLOW-UP MESSAGE TEMPLATES
// ============================================
// Maps pipeline stages to WhatsApp messages.
// Each template is a function that takes location data and returns the message text.
// Messages follow the Belarro sales system rules:
// - Max 4 short paragraphs
// - One question per message
// - No emojis
// - Prices in first message
// - Link to for-chefs page, never PDFs
// - "du" in German, casual but professional

const BASE_LINK_EN = 'https://belarro.com/for-chefs';
const BASE_LINK_DE = 'https://belarro.com/de/for-chefs';

/**
 * Build a personalized for-chefs link with pre-filled restaurant/contact info
 */
function priceLink(base, loc) {
  const params = new URLSearchParams();
  if (loc.locationName) params.set('c', loc.locationName);
  if (loc.contactPerson) params.set('n', loc.contactPerson);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Get the sender name. Defaults to 'Ron' if not provided.
 */
function senderName(userName) {
  return userName || 'Ron';
}

/**
 * All follow-up templates keyed by stage.
 * Each returns { subject, body, nextStage, nextActionDays, nextActionType }
 */
export const FOLLOW_UP_TEMPLATES = {

  // ──────────────────────────────────────────
  // STAGE 1: Thank you + prices (within 1h of visit)
  // ──────────────────────────────────────────
  new_visit: {
    EN: (loc, user) => ({
      body: [
        `Hi ${loc.contactPerson}, this is ${senderName(user)} from Belarro.`,
        `Great meeting you at ${loc.locationName} today. Thanks for your time.`,
        `Here's everything we grow with prices — you can also order directly:`,
        priceLink(BASE_LINK_EN, loc),
        `We deliver every Tuesday. No minimum order, no delivery cost. Let me know if you'd like to test us.`
      ].join('\n\n'),
      nextStage: 'follow_up_1',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    }),
    DE: (loc, user) => ({
      body: [
        `Hi ${loc.contactPerson}, hier ist ${senderName(user)} von Belarro.`,
        `Hat mich gefreut dich bei ${loc.locationName} kennenzulernen. Danke fuer deine Zeit.`,
        `Hier ist unsere komplette Liste mit Preisen — du kannst auch direkt bestellen:`,
        priceLink(BASE_LINK_DE, loc),
        `Wir liefern jeden Dienstag. Keine Mindestbestellung, keine Lieferkosten. Sag Bescheid wenn du uns testen moechtest.`
      ].join('\n\n'),
      nextStage: 'follow_up_1',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 2: Nudge — did the samples work? (2 days)
  // ──────────────────────────────────────────
  follow_up_1: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, did the samples make it onto a plate? Curious what you thought.`,
      nextStage: 'follow_up_2',
      nextActionDays: 3,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, haben es die Proben auf einen Teller geschafft? Wuerde mich interessieren wie sie dir gefallen haben.`,
      nextStage: 'follow_up_2',
      nextActionDays: 3,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 3: Remove friction — low barrier (5 days total)
  // ──────────────────────────────────────────
  follow_up_2: {
    EN: (loc) => ({
      body: [
        `Hi ${loc.contactPerson}, no minimum order, no delivery cost. Even a single 12 EUR pack works.`,
        `Just want you to test us once — see how the process and quality works for your kitchen. Whenever you're ready, just message me.`
      ].join('\n\n'),
      nextStage: 'follow_up_3',
      nextActionDays: 14,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hi ${loc.contactPerson}, keine Mindestbestellung, keine Lieferkosten. Auch eine einzelne 12 EUR Packung geht.`,
        `Probier uns einfach einmal aus — und schau wie der Ablauf und die Qualitaet fuer deine Kueche passt. Meld dich einfach wenn du soweit bist.`
      ].join('\n\n'),
      nextStage: 'follow_up_3',
      nextActionDays: 14,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 4: Re-engage paused lead (2-3 weeks later)
  // ──────────────────────────────────────────
  follow_up_3: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, we just started growing some new varieties. Worth a look: ${priceLink(BASE_LINK_EN, loc)}\n\nWant me to bring some by this Tuesday?`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, wir haben ein paar neue Sorten im Angebot. Schau mal rein: ${priceLink(BASE_LINK_DE, loc)}\n\nSoll ich Dienstag was vorbeibringen?`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    })
  },

  // ──────────────────────────────────────────
  // ORDER CONFIRMED — confirm items + logistics
  // ──────────────────────────────────────────
  // order_confirmed uses extra.deliveryDate (YYYY-MM-DD) set by the date picker.
  // The user picks the delivery Tuesday when pressing Done.
  order_confirmed: {
    EN: (loc, user, extra) => {
      const deliveryISO = extra?.deliveryDate || '';
      const deliveryD = deliveryISO ? new Date(deliveryISO + 'T00:00:00') : null;
      const dateStr = deliveryD
        ? deliveryD.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        : '[delivery date]';
      // Next action = Monday before delivery (1 day before Tuesday)
      const monday = deliveryD ? new Date(deliveryD) : null;
      if (monday) monday.setDate(monday.getDate() - 1);
      return {
        body: [
          `Hi ${loc.contactPerson}, you're on the schedule.`,
          `First delivery: ${dateStr}.`,
          `Invoice comes by email after delivery. If you ever want to change quantities or varieties, just message me.`
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
          `Hi ${loc.contactPerson}, du bist im Plan.`,
          `Erste Lieferung: ${dateStr}.`,
          `Rechnung kommt per Email nach Lieferung. Falls du mal Mengen oder Sorten aendern willst, schreib mir einfach.`
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
  // DELIVERY REMINDER — Monday before first Tuesday delivery (one-time)
  // ──────────────────────────────────────────
  delivery_reminder: {
    EN: (loc, user, extra) => ({
      body: `Hi ${loc.contactPerson}, just confirming — your first delivery is arriving tomorrow (Tuesday). See you then.`,
      nextStage: 'post_delivery',
      nextActionDays: 2, // Wednesday after delivery
      nextActionType: 'whatsapp'
    }),
    DE: (loc, user, extra) => ({
      body: `Hi ${loc.contactPerson}, kurze Bestaetigung — deine erste Lieferung kommt morgen (Dienstag). Bis dann.`,
      nextStage: 'post_delivery',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // POST DELIVERY — one-time check after first delivery
  // ──────────────────────────────────────────
  post_delivery: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, how did everything look? Anything you'd change for next time?`,
      nextStage: 'active_customer',
      nextActionDays: 30,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, wie war alles? Irgendwas das du beim naechsten Mal aendern wuerdest?`,
      nextStage: 'active_customer',
      nextActionDays: 30,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // ACTIVE CUSTOMER — monthly check-in (not weekly!)
  // ──────────────────────────────────────────
  active_customer: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, just checking in. Everything working well with the deliveries? Need to swap or add anything?`,
      nextStage: 'active_customer',
      nextActionDays: 42, // ~6 weeks until next check-in
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, kurzes Check-in. Laeuft alles gut mit den Lieferungen? Willst du was tauschen oder dazunehmen?`,
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
      body: `Hi ${loc.contactPerson}, haven't heard from you in a while. If your menu has changed and you need different varieties, happy to adjust. We're here when you need us.`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, lange nichts gehoert. Falls sich euer Menue geaendert hat und du andere Sorten brauchst, passen wir gerne an. Wir sind da wenn du uns brauchst.`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    })
  }
};

/**
 * Get the follow-up message for a location based on its current pipeline stage.
 * @param {Object} location - Location data from Google Sheet
 * @param {string} userName - Current user's name
 * @param {Object} extra - Optional extra data (items, time, etc.)
 * @returns {{ body: string, nextStage: string, nextActionDays: number|null, nextActionType: string|null, waLink: string }}
 */
export function getFollowUpMessage(location, userName, extra) {
  const stage = location.pipelineStage || 'new_visit';
  const lang = (location.language || 'DE').toUpperCase();
  const template = FOLLOW_UP_TEMPLATES[stage];

  if (!template) {
    return null;
  }

  const langTemplate = template[lang] || template['DE'];
  const result = langTemplate(location, userName, extra);

  // Build WhatsApp deep links — clean phone and fix double country codes
  let phone = (location.directPhone || location.businessPhone || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  // Fix double country code (e.g. 494915906442264 → 4915906442264)
  for (const code of ['972', '44', '43', '49', '1']) {
    if (phone.startsWith(code + code)) { phone = phone.slice(code.length); break; }
  }
  const encodedText = phone ? encodeURIComponent(result.body) : '';

  // Regular WhatsApp link (fallback / iOS / desktop)
  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodedText}`
    : null;

  // WhatsApp Business link (Android intent targeting com.whatsapp.w4b)
  const waBusinessLink = phone
    ? `intent://send/${phone}#Intent;scheme=smsto;package=com.whatsapp.w4b;action=android.intent.action.SENDTO;end`
    : null;

  return {
    ...result,
    waLink,
    waBusinessLink,
    phone,
    stage,
    lang
  };
}

/**
 * Get human-readable label for a pipeline stage
 */
export function getStageLabel(stage) {
  const labels = {
    new_visit: 'Send prices & intro',
    follow_up_1: 'Nudge — how were the samples?',
    follow_up_2: 'Low barrier — test us',
    follow_up_3: 'Re-engage with something new',
    order_confirmed: 'Confirm order details',
    delivery_reminder: 'Remind: delivery tomorrow',
    post_delivery: 'Post-delivery check-in',
    active_customer: 'Monthly check-in',
    inactive: 'Inactive — last attempt',
    closed_won: 'Active customer',
    closed_lost: 'Closed — no follow-up'
  };
  return labels[stage] || stage;
}
