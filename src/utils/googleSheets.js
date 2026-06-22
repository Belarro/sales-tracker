// ============================================
// DATA LAYER — Supabase
// ============================================
// Replaces Google Sheets API. All reads/writes go through Supabase.

import { CONFIG } from '../config.js';
import { getCurrentTimestamp } from './dateUtils.js';
import { supabase } from './supabaseClient.js';
import { mirrorToSheets } from './syncSheets.js';

// ============================================
// HELPERS
// ============================================

const isPhoneNumber = (val) => typeof val === 'string' && /^\+\d{1,3}[\d\s\-()+]+$/.test(val);

const sanitize = (val) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.substring(0, 2000);
  if (isPhoneNumber(trimmed)) return trimmed;
  if (/^[=+\-@\t]/.test(trimmed)) return "'" + trimmed;
  return trimmed;
};

const sanitizeObject = (obj) => {
  const out = {};
  for (const key of Object.keys(obj)) {
    out[key] = sanitize(obj[key]);
  }
  return out;
};

// Map JS camelCase keys → Supabase snake_case columns
const toRow = (d) => ({
  location_name:      d.locationName      || '',
  business_address:   d.businessAddress   || '',
  contact_person:     d.contactPerson     || '',
  contact_title:      d.contactTitle      || '',
  direct_phone:       d.directPhone       || '',
  direct_email:       d.directEmail       || '',
  business_types:     d.businessTypes     || '',
  interest_level:     d.interestLevel     || '',
  visit_notes:        d.visitNotes        || '',
  timestamp:          d.timestamp         || '',
  follow_up_date:     d.followUpDate      || '',
  sample_given:       d.sampleGiven       || '',
  sales_rep:          d.salesRep          || '',
  direct_link:        d.directLink        || '',
  business_phone:     d.businessPhone     || '',
  business_email:     d.businessEmail     || '',
  business_website:   d.businessWebsite   || '',
  archived:           d.archived          || '',
  pipeline_stage:     d.pipelineStage     || CONFIG.PIPELINE_STAGES.NEW_VISIT,
  follow_up_count:    String(d.followUpCount || '0'),
  last_follow_up_date: d.lastFollowUpDate || '',
  next_action_date:   d.nextActionDate    || '',
  next_action_type:   d.nextActionType    || '',
  automation_status:  d.automationStatus  || '',
  materials_sent:     d.materialsSent     || '',
  notes_internal:     d.notesInternal     || '',
  language:           d.language          || '',
  uses_microgreens:   d.usesMicrogreens   === true || d.usesMicrogreens === 'YES'
});

// Map Supabase snake_case row → app camelCase object
const fromRow = (r) => ({
  locationName:      r.location_name      || '',
  businessAddress:   r.business_address   || '',
  contactPerson:     r.contact_person     || '',
  contactTitle:      r.contact_title      || '',
  directPhone:       r.direct_phone       || '',
  directEmail:       r.direct_email       || '',
  businessTypes:     r.business_types     || '',
  interestLevel:     r.interest_level     || '',
  visitNotes:        r.visit_notes        || '',
  timestamp:         r.timestamp          || '',
  followUpDate:      r.follow_up_date     || '',
  sampleGiven:       r.sample_given       || '',
  salesRep:          r.sales_rep          || '',
  directLink:        r.direct_link        || '',
  businessPhone:     r.business_phone     || '',
  businessEmail:     r.business_email     || '',
  businessWebsite:   r.business_website   || '',
  archived:          r.archived           || '',
  pipelineStage:     r.pipeline_stage     || '',
  followUpCount:     r.follow_up_count    || '0',
  lastFollowUpDate:  r.last_follow_up_date || '',
  nextActionDate:    r.next_action_date   || '',
  nextActionType:    r.next_action_type   || '',
  automationStatus:  r.automation_status  || '',
  materialsSent:     r.materials_sent     || '',
  notesInternal:     r.notes_internal     || '',
  language:          r.language           || '',
  usesMicrogreens:   r.uses_microgreens   === true
});

// ============================================
// INIT (no-op — kept for compatibility)
// ============================================

export const initSheetsAPI = async () => {
  console.log('Data layer ready (Supabase)');
};

export const ensureDataHeaders = async () => {
  // No-op — Supabase has fixed schema
};

export const ensureToVisitHeaders = async () => {
  // No-op — Supabase has fixed schema
};

// ============================================
// AUTHORIZED USERS
// ============================================

export const getAuthorizedUsers = async () => {
  const { data, error } = await supabase
    .from('authorized_users')
    .select('email');
  if (error) { console.error('getAuthorizedUsers:', error.message); return []; }
  return data.map(r => r.email);
};

export const addAuthorizedUser = async (email) => {
  const { error } = await supabase
    .from('authorized_users')
    .insert({ email });
  if (error) { console.error('addAuthorizedUser:', error.message); return false; }
  return true;
};

export const removeAuthorizedUser = async (email) => {
  const { error } = await supabase
    .from('authorized_users')
    .delete()
    .eq('email', email);
  if (error) { console.error('removeAuthorizedUser:', error.message); return false; }
  return true;
};

// ============================================
// ADMIN EMAILS
// ============================================

export const getAdminEmails = async () => {
  const { data, error } = await supabase
    .from('admin_emails')
    .select('email');
  if (error) {
    console.warn('getAdminEmails:', error.message);
    return CONFIG.ADMIN_EMAILS || [];
  }
  const sheetAdmins = data.map(r => r.email);
  return [...new Set([...(CONFIG.ADMIN_EMAILS || []), ...sheetAdmins])];
};

export const getSheetAdmins = async () => {
  const { data, error } = await supabase
    .from('admin_emails')
    .select('email');
  if (error) { return []; }
  return data.map(r => r.email);
};

export const getEnvAdmins = () => CONFIG.ADMIN_EMAILS || [];

export const addAdminEmail = async (email) => {
  const { error } = await supabase
    .from('admin_emails')
    .insert({ email });
  if (error) { console.error('addAdminEmail:', error.message); return false; }
  return true;
};

export const removeAdminEmail = async (email) => {
  const { error } = await supabase
    .from('admin_emails')
    .delete()
    .eq('email', email);
  if (error) { console.error('removeAdminEmail:', error.message); return false; }
  return true;
};

// ============================================
// LOCATIONS
// ============================================

export const getAllLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllLocations:', error.message); return []; }
  return data.map(fromRow);
};

export const checkLocationExists = async (locationName, businessAddress) => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('location_name', locationName)
    .eq('business_address', businessAddress)
    .maybeSingle();
  if (error) { console.error('checkLocationExists:', error.message); return null; }
  return data ? fromRow(data) : null;
};

export const saveLocationData = async (locationData, userName, userEmail) => {
  const timestamp = getCurrentTimestamp();

  const fullData = sanitizeObject({
    locationName:     locationData.locationName     || '',
    businessAddress:  locationData.businessAddress  || '',
    contactPerson:    locationData.contactPerson    || '',
    contactTitle:     locationData.contactTitle     || '',
    directPhone:      locationData.directPhone      || '',
    directEmail:      locationData.directEmail      || '',
    businessTypes:    locationData.businessTypes    || '',
    interestLevel:    locationData.interestLevel    || '',
    visitNotes:       locationData.visitNotes       || '',
    timestamp:        timestamp,
    followUpDate:     locationData.followUpDate     || locationData.nextActionDate || '',
    sampleGiven:      locationData.sampleGiven      || '',
    salesRep:         userName,
    directLink:       locationData.directLink       || '',
    businessPhone:    locationData.businessPhone    || '',
    businessEmail:    locationData.businessEmail    || '',
    businessWebsite:  locationData.businessWebsite  || '',
    archived:         locationData.archived         || '',
    pipelineStage:    locationData.pipelineStage    || CONFIG.PIPELINE_STAGES.NEW_VISIT,
    followUpCount:    String(locationData.followUpCount || '0'),
    lastFollowUpDate: locationData.lastFollowUpDate || '',
    nextActionDate:   locationData.nextActionDate   || '',
    nextActionType:   locationData.nextActionType   || '',
    automationStatus: locationData.automationStatus || '',
    materialsSent:    locationData.materialsSent    || '',
    notesInternal:    locationData.notesInternal    || '',
    language:         locationData.language         || '',
  });
  fullData.usesMicrogreens = locationData.usesMicrogreens || false;

  // Always append to visit history
  await addVisitToHistory(fullData);

  // Upsert into locations (update if exists, insert if new)
  const row = toRow(fullData);
  const { error } = await supabase
    .from('locations')
    .upsert(row, { onConflict: 'location_name,business_address' });

  if (error) {
    console.error('saveLocationData:', error.message);
    throw new Error(error.message);
  }

  // Mirror to Google Sheets in background (best-effort, non-blocking)
  mirrorToSheets(fullData);

  return true;
};

// ============================================
// VISIT HISTORY
// ============================================

export const addVisitToHistory = async (visitData) => {
  const row = toRow(visitData);
  // history has no unique constraint — always insert
  const { error } = await supabase
    .from('visit_history')
    .insert(row);
  if (error) {
    console.error('addVisitToHistory:', error.message);
    throw error;
  }
  return true;
};

export const getLocationHistory = async (locationName, businessAddress) => {
  const { data, error } = await supabase
    .from('visit_history')
    .select('*')
    .eq('location_name', locationName)
    .eq('business_address', businessAddress)
    .order('created_at', { ascending: false });
  if (error) { console.error('getLocationHistory:', error.message); return []; }
  return data.map(fromRow);
};

// ============================================
// ARCHIVE / UNARCHIVE / DELETE
// ============================================

export const archiveLocation = async (locationName, businessAddress) => {
  const { error } = await supabase
    .from('locations')
    .update({ archived: 'YES' })
    .eq('location_name', locationName)
    .eq('business_address', businessAddress);
  if (error) { console.error('archiveLocation:', error.message); return false; }
  return true;
};

export const unarchiveLocation = async (locationName, businessAddress) => {
  const { error } = await supabase
    .from('locations')
    .update({ archived: '' })
    .eq('location_name', locationName)
    .eq('business_address', businessAddress);
  if (error) { console.error('unarchiveLocation:', error.message); return false; }
  return true;
};

export const deleteLocation = async (locationName, businessAddress) => {
  const [loc, hist] = await Promise.all([
    supabase.from('locations').delete()
      .eq('location_name', locationName)
      .eq('business_address', businessAddress),
    supabase.from('visit_history').delete()
      .eq('location_name', locationName)
      .eq('business_address', businessAddress)
  ]);
  if (loc.error) { console.error('deleteLocation:', loc.error.message); return false; }
  return true;
};

// ============================================
// PIPELINE
// ============================================

export const updatePipelineData = async (locationName, businessAddress, pipelineData) => {
  const update = {};
  if (pipelineData.pipelineStage    !== undefined) update.pipeline_stage      = pipelineData.pipelineStage;
  if (pipelineData.followUpCount    !== undefined) update.follow_up_count     = String(pipelineData.followUpCount);
  if (pipelineData.lastFollowUpDate !== undefined) update.last_follow_up_date = pipelineData.lastFollowUpDate;
  if (pipelineData.nextActionDate   !== undefined) update.next_action_date    = pipelineData.nextActionDate;
  if (pipelineData.nextActionType   !== undefined) update.next_action_type    = pipelineData.nextActionType;
  if (pipelineData.automationStatus !== undefined) update.automation_status   = pipelineData.automationStatus;
  if (pipelineData.materialsSent    !== undefined) update.materials_sent      = pipelineData.materialsSent;
  if (pipelineData.notesInternal    !== undefined) update.notes_internal      = pipelineData.notesInternal;

  const { error } = await supabase
    .from('locations')
    .update(update)
    .eq('location_name', locationName)
    .eq('business_address', businessAddress);

  if (error) { console.error('updatePipelineData:', error.message); return false; }
  return true;
};

// ============================================
// NOTE TEMPLATES
// ============================================

export const getNoteTemplates = async () => {
  const { data, error } = await supabase
    .from('note_templates')
    .select('template')
    .order('created_at', { ascending: true });
  if (error || !data?.length) return CONFIG.DEFAULT_NOTE_TEMPLATES;
  return data.map(r => r.template);
};

export const addNoteTemplate = async (template) => {
  const { error } = await supabase
    .from('note_templates')
    .insert({ template });
  if (error) { console.error('addNoteTemplate:', error.message); return false; }
  return true;
};

export const removeNoteTemplate = async (template) => {
  const { error } = await supabase
    .from('note_templates')
    .delete()
    .eq('template', template);
  if (error) { console.error('removeNoteTemplate:', error.message); return false; }
  return true;
};

// ============================================
// PROSPECTS (To Visit)
// ============================================

export const getProspects = async () => {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getProspects:', error.message); return []; }
  return data.map((r, i) => ({
    locationName:     r.location_name    || '',
    businessAddress:  r.business_address || '',
    prospectNotes:    r.prospect_notes   || '',
    dateAdded:        r.date_added       || '',
    lat:              r.lat              ?? null,
    lng:              r.lng              ?? null,
    usesMicrogreens:  r.uses_microgreens === true,
    isProspect:       true,
    _prospectId:      r.id
  }));
};

export const addProspect = async (name, address, notes = '', lat = null, lng = null, usesMicrogreens = false) => {
  const { error } = await supabase
    .from('prospects')
    .upsert({
      location_name:    name,
      business_address: address,
      prospect_notes:   notes,
      date_added:       getCurrentTimestamp(),
      lat:              lat,
      lng:              lng,
      uses_microgreens: usesMicrogreens
    }, { onConflict: 'location_name,business_address' });
  if (error) { console.error('addProspect:', error.message); return false; }
  return true;
};

export const deleteProspect = async (prospectId) => {
  // prospectId is now the UUID from Supabase (stored as _prospectId)
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', prospectId);
  if (error) { console.error('deleteProspect:', error.message); return false; }
  return true;
};

// ============================================
// LEGACY STUBS (keep callers from breaking)
// ============================================
export const createSheet = async () => true;
