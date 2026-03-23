// ============================================
// DATE UTILITIES
// ============================================
// Handles follow-up date calculations

/**
 * Calculate follow-up date (4 days ahead, skipping weekends)
 * @returns {string} Follow-up date in DD-MM-YYYY format
 */
export const calculateFollowUpDate = (daysAhead = 4) => {
  const today = new Date();
  let followUpDate = new Date(today);
  followUpDate.setDate(followUpDate.getDate() + daysAhead);

  // Check if follow-up falls on weekend
  const dayOfWeek = followUpDate.getDay();

  // If Saturday (6), push to Monday
  if (dayOfWeek === 6) {
    followUpDate.setDate(followUpDate.getDate() + 2);
  }
  // If Sunday (0), push to Monday
  else if (dayOfWeek === 0) {
    followUpDate.setDate(followUpDate.getDate() + 1);
  }

  return formatDateDDMMYYYY(followUpDate);
};

/**
 * Format date to DD-MM-YYYY
 * @param {Date|string} date - Date object or date string
 * @returns {string} Date in DD-MM-YYYY format
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format date for display
 * @param {string} dateString - Date in any format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  // If already in DD-MM-YYYY format, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString;
  }
  const date = new Date(dateString);
  return formatDateDDMMYYYY(date);
};

/**
 * Get current timestamp in DD-MM-YYYY HH:MM format
 * @returns {string} Current timestamp
 */
export const getCurrentTimestamp = () => {
  const now = new Date();
  const date = formatDateDDMMYYYY(now);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${date} ${hours}:${minutes}`;
};

// ============================================
// PIPELINE DATE UTILITIES
// ============================================

/**
 * Convert a Date object to YYYY-MM-DD string (for HTML date inputs)
 */
export const toISODateString = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convert a Date object to DD.MM.YYYY string (European format for sheet storage)
 */
export const toEUDateString = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Calculate a next-action date N business days from today, skipping weekends.
 * Returns YYYY-MM-DD format for automation compatibility.
 */
export const calculateNextActionDate = (daysAhead) => {
  const date = new Date();
  let added = 0;
  while (added < daysAhead) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return toISODateString(date);
};

// ============================================
// FOLLOW-UP DAY SNAPPING (Monday + Thursday)
// ============================================
// Follow-ups are batched to Monday and Thursday mornings.
// Field visit days: Wednesday, Thursday, Friday.
// This ensures max 3 business days between action and follow-up.

const FOLLOW_UP_DAYS = [1, 4]; // Monday = 1, Thursday = 4

/**
 * Find the next Monday or Thursday on or after a given date.
 * If the date itself is a follow-up day, returns that date.
 */
export const snapToFollowUpDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();

  if (FOLLOW_UP_DAYS.includes(dow)) return d;

  // Find the closest upcoming Monday or Thursday
  let bestDiff = Infinity;
  for (const target of FOLLOW_UP_DAYS) {
    const diff = (target - dow + 7) % 7;
    if (diff > 0 && diff < bestDiff) bestDiff = diff;
  }
  d.setDate(d.getDate() + bestDiff);
  return d;
};

/**
 * Calculate the next follow-up date snapped to Monday or Thursday.
 * First adds daysAhead calendar days, then snaps to the next Mon/Thu.
 * Returns YYYY-MM-DD format (ISO, for date picker and calendar API).
 */
export const calculateSnappedFollowUpDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const snapped = snapToFollowUpDay(date);
  return toISODateString(snapped);
};

/**
 * Parse DD.MM.YYYY, DD-MM-YYYY, or YYYY-MM-DD into a JS Date object.
 * Returns null on failure.
 */
export const parseAppDate = (dateStr) => {
  if (!dateStr) return null;
  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  // European DD.MM.YYYY format
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('.');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }
  // Legacy DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }
  return null;
};

/**
 * Return the number of calendar days between today (midnight) and a given date string.
 * Negative = in the past (overdue). Positive = in the future.
 */
export const daysFromToday = (dateStr) => {
  const target = parseAppDate(dateStr);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

// ============================================
// DELIVERY DATE CALCULATOR
// ============================================
// Belarro seeding: Tuesdays (14+ day crops) and Fridays (10-day crops).
// Delivery: Tuesdays only.
// Each product has a known grow time. The delivery date is the first
// Tuesday on or after ALL ordered products are ready.

// Grow times in days for each product (from products.json growing_stages)
export const PRODUCT_GROW_DAYS = {
  'pea-shoots':     { name: 'Pea Shoots',         name_de: 'Erbsensprossen',       days: 15, category: 'shoot' },
  'peas-salad':     { name: 'Pea Salad',           name_de: 'Erbsensalat',          days: 15, category: 'shoot' },
  'sunflower':      { name: 'Sunflower',           name_de: 'Sonnenblume',           days: 12, category: 'shoot' },
  'corn':           { name: 'Popcorn Shoots',      name_de: 'Popcorn-Sprossen',      days: 11, category: 'shoot' },
  'wheatgrass':     { name: 'Wheatgrass',          name_de: 'Weizengras',            days: 15, category: 'microgreen' },
  'amaranth':       { name: 'Amaranth',            name_de: 'Amaranth',              days: 18, category: 'microgreen' },
  'red-beet-bull':  { name: 'Red Beet',            name_de: 'Rote Bete',             days: 21, category: 'microgreen' },
  'radish-daikon':  { name: 'Radish Daikon',       name_de: 'Rettich Daikon',        days: 10, category: 'microgreen' },
  'radish-red-rambo':{ name: 'Red Rambo Radish',   name_de: 'Rettich Red Rambo',     days: 10, category: 'microgreen' },
  'redish-mix':     { name: 'Radish Mix',          name_de: 'Rettich-Mix',           days: 10, category: 'mix' },
  'broccoli':       { name: 'Broccoli',            name_de: 'Brokkoli',              days: 10, category: 'microgreen' },
  'red-cabbage':    { name: 'Red Cabbage',         name_de: 'Rotkohl',               days: 10, category: 'microgreen' },
  'red-kohlrabi':   { name: 'Red Kohlrabi',        name_de: 'Roter Kohlrabi',        days: 10, category: 'microgreen' },
  'mustard-white':  { name: 'White Mustard',       name_de: 'Weißer Senf',          days: 10, category: 'microgreen' },
  'kale':           { name: 'Black Kale',          name_de: 'Schwarzkohl',           days: 14, category: 'microgreen' },
  'pak-choi':       { name: 'Pak Choi',            name_de: 'Pak Choi',              days: 10, category: 'microgreen' },
  'yellow-beet':    { name: 'Yellow Beet',         name_de: 'Gelbe Bete',            days: 28, category: 'microgreen' },
  'nasturtium':     { name: 'Nasturtium Alaska',   name_de: 'Kapuzinerkresse Alaska', days: 11, category: 'petite_herb' },
  'coriander':      { name: 'Coriander',           name_de: 'Koriander',             days: 21, category: 'petite_herb' },
  'rocket':         { name: 'Wild Rocket',         name_de: 'Rucola',                days: 10, category: 'petite_herb' },
  'dill':           { name: 'Dill',                name_de: 'Dill',                  days: 21, category: 'petite_herb' },
  'leek':           { name: 'Leek',                name_de: 'Lauch',                 days: 14, category: 'petite_herb' },
  'garlic':         { name: 'Garlic Chives',       name_de: 'Knoblauch-Schnittlauch', days: 14, category: 'petite_herb' },
  'fennel':         { name: 'Fennel',              name_de: 'Fenchel',               days: 21, category: 'petite_herb' },
  'parsley':        { name: 'Parsley',             name_de: 'Petersilie',            days: 28, category: 'petite_herb' },
};

/**
 * Find the next occurrence of a weekday (0=Sun..6=Sat) on or after `from`.
 */
function nextWeekday(from, dayOfWeek) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
  return d;
}

/**
 * For a single product seeded on a given date, calculate when it's ready.
 * Seeding days: Tuesday and Friday.
 * The product gets seeded on the NEXT seeding day (Tue or Fri) after order.
 */
function productReadyDate(orderDate, growDays) {
  const start = new Date(orderDate);
  start.setDate(start.getDate() + 1); // can't seed same day

  // Next seeding day is whichever comes first: Tuesday(2) or Friday(5)
  const nextTue = nextWeekday(start, 2);
  const nextFri = nextWeekday(start, 5);
  const seedDay = nextTue <= nextFri ? nextTue : nextFri;

  const ready = new Date(seedDay);
  ready.setDate(ready.getDate() + Math.ceil(growDays));
  return ready;
}

/**
 * Calculate the first delivery Tuesday when ALL ordered products are ready.
 * @param {string[]} productSlugs - array of product slugs from PRODUCT_GROW_DAYS
 * @param {Date} [orderDate] - defaults to today
 * @returns {{ deliveryDate: Date, deliveryISO: string, maxGrowDays: number, slowestProduct: string }}
 */
export const calculateDeliveryDate = (productSlugs = [], orderDate) => {
  const from = orderDate ? new Date(orderDate) : new Date();
  from.setHours(0, 0, 0, 0);

  if (productSlugs.length === 0) {
    // No products selected — default to 14 days from next seeding Tuesday
    const start = new Date(from);
    start.setDate(start.getDate() + 1);
    const seedTue = nextWeekday(start, 2);
    const delivery = new Date(seedTue);
    delivery.setDate(delivery.getDate() + 14);
    const deliveryTue = nextWeekday(delivery, 2);
    return {
      deliveryDate: deliveryTue,
      deliveryISO: toISODateString(deliveryTue),
      maxGrowDays: 14,
      slowestProduct: ''
    };
  }

  let latestReady = new Date(0);
  let maxGrowDays = 0;
  let slowestProduct = '';

  for (const slug of productSlugs) {
    const product = PRODUCT_GROW_DAYS[slug];
    if (!product) continue;
    const ready = productReadyDate(from, product.days);
    if (ready > latestReady) {
      latestReady = ready;
      maxGrowDays = product.days;
      slowestProduct = product.name;
    }
  }

  // Delivery is the first Tuesday on or after the slowest product is ready
  const deliveryTue = nextWeekday(latestReady, 2);

  return {
    deliveryDate: deliveryTue,
    deliveryISO: toISODateString(deliveryTue),
    maxGrowDays,
    slowestProduct
  };
};