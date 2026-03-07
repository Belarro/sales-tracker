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

const PRICE_LIST_LINK_EN = 'https://belarro.com/for-chefs';
const PRICE_LIST_LINK_DE = 'https://belarro.com/de/for-chefs';

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
        `Here's everything we grow with prices:`,
        PRICE_LIST_LINK_EN,
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
        `Hier ist unsere komplette Liste mit Preisen:`,
        PRICE_LIST_LINK_DE,
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
      body: `Hi ${loc.contactPerson}, we just started growing some new varieties. Worth a look: ${PRICE_LIST_LINK_EN}\n\nWant me to bring some by this Tuesday?`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, wir haben ein paar neue Sorten im Angebot. Schau mal rein: ${PRICE_LIST_LINK_DE}\n\nSoll ich Dienstag was vorbeibringen?`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    })
  },

  // ──────────────────────────────────────────
  // ORDER CONFIRMED — confirm items + logistics
  // ──────────────────────────────────────────
  order_confirmed: {
    EN: (loc, user, extra) => ({
      body: [
        `Hi ${loc.contactPerson}, you're on the schedule.`,
        `First delivery: Tuesday${extra?.time ? ' around ' + extra.time : ''}.`,
        extra?.items ? extra.items : '[Items and prices here]',
        `Invoice comes by email after delivery. If you ever want to change quantities or varieties, just message me.`
      ].join('\n\n'),
      nextStage: 'delivery_reminder',
      nextActionDays: null, // set manually based on next Tuesday
      nextActionType: 'whatsapp'
    }),
    DE: (loc, user, extra) => ({
      body: [
        `Hi ${loc.contactPerson}, du bist im Plan.`,
        `Erste Lieferung: Dienstag${extra?.time ? ' gegen ' + extra.time : ''}.`,
        extra?.items ? extra.items : '[Artikel und Preise hier]',
        `Rechnung kommt per Email nach Lieferung. Falls du mal Mengen oder Sorten aendern willst, schreib mir einfach.`
      ].join('\n\n'),
      nextStage: 'delivery_reminder',
      nextActionDays: null,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // DELIVERY REMINDER — Monday before Tuesday delivery
  // ──────────────────────────────────────────
  delivery_reminder: {
    EN: (loc, user, extra) => ({
      body: `Hi ${loc.contactPerson}, confirming tomorrow: ${extra?.items || 'your order'} around ${extra?.time || 'noon'}. See you then.`,
      nextStage: 'post_delivery',
      nextActionDays: 2, // Wednesday
      nextActionType: 'whatsapp'
    }),
    DE: (loc, user, extra) => ({
      body: `Hi ${loc.contactPerson}, kurze Bestaetigung fuer morgen: ${extra?.items || 'deine Bestellung'} gegen ${extra?.time || 'Mittag'}. Bis dann.`,
      nextStage: 'post_delivery',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // POST DELIVERY — Wednesday check-in
  // ──────────────────────────────────────────
  post_delivery: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, how did everything look yesterday? Anything you'd change for next week?`,
      nextStage: 'recurring',
      nextActionDays: 4, // Sunday
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, wie war alles gestern? Irgendwas das du fuer naechste Woche aendern wuerdest?`,
      nextStage: 'recurring',
      nextActionDays: 4,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // RECURRING — Sunday order reminder
  // ──────────────────────────────────────────
  recurring: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, order for Tuesday? Same as last week or any changes?`,
      nextStage: 'recurring',
      nextActionDays: 7,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, Bestellung fuer Dienstag? Gleich wie letzte Woche oder Aenderungen?`,
      nextStage: 'recurring',
      nextActionDays: 7,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // INACTIVE 2 WEEKS — gentle check-in
  // ──────────────────────────────────────────
  inactive_2wk: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, everything good with you? Want me to bring something this Tuesday?`,
      nextStage: 'inactive_1mo',
      nextActionDays: 14,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, alles gut bei euch? Soll ich Dienstag wieder was mitbringen?`,
      nextStage: 'inactive_1mo',
      nextActionDays: 14,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // INACTIVE 1 MONTH — last attempt
  // ──────────────────────────────────────────
  inactive_1mo: {
    EN: (loc) => ({
      body: `Hi ${loc.contactPerson}, if your menu has changed and you need different varieties, happy to adjust. We're here when you need us.`,
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: `Hi ${loc.contactPerson}, falls sich euer Menue geaendert hat und du andere Sorten brauchst, passen wir gerne an. Wir sind da wenn du uns brauchst.`,
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

  // Build WhatsApp deep link
  const phone = (location.directPhone || location.businessPhone || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(result.body)}`
    : null;

  return {
    ...result,
    waLink,
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
    delivery_reminder: 'Delivery reminder (Monday)',
    post_delivery: 'Post-delivery check-in',
    recurring: 'Weekly order reminder',
    inactive_2wk: 'Inactive 2 weeks',
    inactive_1mo: 'Inactive 1 month',
    closed_won: 'Active customer',
    closed_lost: 'Closed — no follow-up'
  };
  return labels[stage] || stage;
}
