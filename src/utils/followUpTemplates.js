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
  if (loc.locationName) params.set('c', loc.locationName);
  if (loc.contactPerson) params.set('n', loc.contactPerson);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * All follow-up templates keyed by stage.
 * Each returns { body, emailBody, emailSubject, nextStage, nextActionDays, nextActionType }
 */
export const FOLLOW_UP_TEMPLATES = {

  // ──────────────────────────────────────────
  // STAGE 0.5: Same day — samples feedback + intro
  // ──────────────────────────────────────────
  new_visit: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson}, Ron from Belarro. Good meeting you today.`,
        `How did the samples perform for you on the plate?`,
        `We deliver fresh every Tuesday.`,
        `Orders are recurring, so once set, it runs.`
      ].join('\n\n'),
      emailSubject: 'Belarro',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Good meeting you today.`,
        `Here is the full list:\n${priceLink(BASE_LINK_EN, loc)}`,
        `Everything is grown to order and delivered fresh every Tuesday.`,
        `No minimum, no delivery fee.`,
        `Orders are recurring, so once started, it runs.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_1',
      nextActionDays: 0,  // same day — send list right after
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson}, Ron von Belarro. Hat mich gefreut dich heute kennenzulernen.`,
        `Wie haben die Proben bei dir auf dem Teller funktioniert?`,
        `Wir liefern jeden Dienstag frisch.`,
        `Bestellungen laufen automatisch weiter, einmal eingerichtet laeuft es.`
      ].join('\n\n'),
      emailSubject: 'Belarro',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Hat mich gefreut dich heute kennenzulernen.`,
        `Hier ist die komplette Liste:\n${priceLink(BASE_LINK_DE, loc)}`,
        `Alles wird auf Bestellung angebaut und jeden Dienstag frisch geliefert.`,
        `Keine Mindestbestellung, keine Lieferkosten.`,
        `Bestellungen laufen automatisch weiter, einmal eingerichtet laeuft es.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_1',
      nextActionDays: 0,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 1: Send the list — same day or next
  // ──────────────────────────────────────────
  follow_up_1: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson}, as promised:`,
        `Varieties + prices: ${priceLink(BASE_LINK_EN, loc)}`,
        `Everything is grown to order and delivered fresh every Tuesday.`,
        `No minimum, no delivery fee.`
      ].join('\n\n'),
      emailSubject: 'Varieties + prices',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `As promised, here is the full list:\n${priceLink(BASE_LINK_EN, loc)}`,
        `Everything is grown to order and delivered fresh every Tuesday.`,
        `No minimum, no delivery fee.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_2',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson}, wie versprochen:`,
        `Sorten + Preise: ${priceLink(BASE_LINK_DE, loc)}`,
        `Alles wird auf Bestellung angebaut und jeden Dienstag frisch geliefert.`,
        `Keine Mindestbestellung, keine Lieferkosten.`
      ].join('\n\n'),
      emailSubject: 'Sorten + Preise',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Wie versprochen, hier ist die komplette Liste:\n${priceLink(BASE_LINK_DE, loc)}`,
        `Alles wird auf Bestellung angebaut und jeden Dienstag frisch geliefert.`,
        `Keine Mindestbestellung, keine Lieferkosten.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_2',
      nextActionDays: 2,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 2: Which samples worked? (+2 days)
  // ──────────────────────────────────────────
  follow_up_2: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Which of the samples worked best for you?`
      ].join('\n\n'),
      emailSubject: 'Samples',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `How did the samples perform for you?`,
        `Which one worked best on your dishes?`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_3',
      nextActionDays: 5,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Welche der Proben haben bei dir am besten funktioniert?`
      ].join('\n\n'),
      emailSubject: 'Proben',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Wie haben die Proben bei dir funktioniert?`,
        `Welche hat am besten auf deinen Gerichten funktioniert?`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_3',
      nextActionDays: 5,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 3: Start with one box (+5 days)
  // ──────────────────────────────────────────
  follow_up_3: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `You can start with one small box next Tuesday.`,
        `From there we refine based on your dishes.`
      ].join('\n\n'),
      emailSubject: 'First box',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `You can start with a small box next Tuesday.`,
        `From there we refine based on your needs.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_4',
      nextActionDays: 7,
      nextActionType: 'whatsapp'
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Du kannst naechsten Dienstag mit einer kleinen Box anfangen.`,
        `Danach passen wir alles an deine Gerichte an.`
      ].join('\n\n'),
      emailSubject: 'Erste Box',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Du kannst naechsten Dienstag mit einer kleinen Box anfangen.`,
        `Danach passen wir alles an deine Beduerfnisse an.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'follow_up_4',
      nextActionDays: 7,
      nextActionType: 'whatsapp'
    })
  },

  // ──────────────────────────────────────────
  // STAGE 4: Closing seeding cycle (+7 days)
  // ──────────────────────────────────────────
  follow_up_4: {
    EN: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `I am closing the next seeding cycle.`,
        `Shall I include you with a small first box?`
      ].join('\n\n'),
      emailSubject: 'Tuesday',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `I am closing the next seeding cycle.`,
        `Let me know if you want to be included.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'closed_lost',
      nextActionDays: null,
      nextActionType: null
    }),
    DE: (loc) => ({
      body: [
        `Hey ${loc.contactPerson},`,
        `Ich schliesse den naechsten Aussaat-Zyklus ab.`,
        `Soll ich dich mit einer kleinen ersten Box einplanen?`
      ].join('\n\n'),
      emailSubject: 'Dienstag',
      emailBody: [
        `Hi ${loc.contactPerson},`,
        `Ich schliesse den naechsten Aussaat-Zyklus ab.`,
        `Sag mir Bescheid wenn du dabei sein willst.`,
        `Ron`
      ].join('\n\n'),
      nextStage: 'closed_lost',
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
  let phone = (location.directPhone || location.businessPhone || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  for (const code of ['972', '44', '43', '49', '1']) {
    if (phone.startsWith(code + code)) { phone = phone.slice(code.length); break; }
  }
  if (phone.startsWith('0')) { phone = '49' + phone.slice(1); }
  const encodedText = phone ? encodeURIComponent(result.body) : '';
  const waLink = phone ? `https://wa.me/${phone}?text=${encodedText}` : null;

  return { ...result, waLink, phone, stage, lang };
}

/**
 * Get human-readable label for a pipeline stage
 */
export function getStageLabel(stage) {
  const labels = {
    new_visit: 'Intro + samples feedback',
    follow_up_1: 'Send varieties + prices',
    follow_up_2: 'Which samples worked?',
    follow_up_3: 'Start with one box',
    follow_up_4: 'Closing seeding cycle',
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
