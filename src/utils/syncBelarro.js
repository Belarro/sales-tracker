/**
 * Sync Saletracker prospect to Belarro Supabase
 * Called when Ron saves a contact after visiting a restaurant
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (uses Belarro's project)
const SUPABASE_URL = 'https://gcgscmtjesyiziebutzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ3NjbXRqZXN5aXppZWJ1dHoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3MDA0NDAyOCwiZXhwIjoyMDg1NjIwMDI4fQ.Ikf7mpFUKPJx9wA827xHTxSV2u5JpWCPw7j6wiKbgN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Sync a prospect from Saletracker to Belarro automation system
 * @param {Object} prospectData - Prospect information from Saletracker
 * @returns {Promise<{success: boolean, id: string, error?: string}>}
 */
export async function syncProspectToSupabase(prospectData) {
  const {
    locationName,
    contactPerson,
    directPhone,
    directEmail = null,
    language = 'DE',
    visitNotes = '',
    sampleGiven = false,
    visitDate = new Date().toISOString()
  } = prospectData;

  try {
    // Validate required fields
    if (!locationName || !contactPerson || !directPhone) {
      return {
        success: false,
        error: 'Missing required fields: locationName, contactPerson, directPhone'
      };
    }

    // Prepare payload
    const payload = {
      location_name: locationName,
      contact_person: contactPerson,
      direct_phone: directPhone,
      direct_email: directEmail,
      language: language.toUpperCase(),
      visit_notes: visitNotes,
      sample_given: sampleGiven,
      visit_date: visitDate,
      pipeline_stage: 'new_visit',
      next_action_date: new Date().toISOString().split('T')[0], // TODAY
      automation_status: 'pending',
      follow_up_count: 0,
      updated_at: new Date().toISOString()
    };

    // Check if prospect already exists (by location + phone)
    const { data: existing, error: checkError } = await supabase
      .from('sales_prospects')
      .select('id')
      .eq('location_name', locationName)
      .eq('direct_phone', directPhone)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected)
      throw checkError;
    }

    let result;

    if (existing) {
      // Update existing prospect
      const { data, error } = await supabase
        .from('sales_prospects')
        .update(payload)
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) throw error;
      result = data;
      console.log(`✅ Updated prospect: ${locationName}`);
    } else {
      // Insert new prospect
      const { data, error } = await supabase
        .from('sales_prospects')
        .insert([payload])
        .select('id')
        .single();

      if (error) throw error;
      result = data;
      console.log(`✅ Created prospect: ${locationName}`);
    }

    return {
      success: true,
      id: result.id,
      locationName,
      contactPerson
    };
  } catch (err) {
    console.error('❌ Sync error:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Check sync status for a prospect
 * @param {string} prospectId - UUID of the prospect
 * @returns {Promise<Object>}
 */
export async function getProspectStatus(prospectId) {
  try {
    const { data, error } = await supabase
      .from('sales_prospects')
      .select('pipeline_stage, automation_status, next_action_date, follow_up_count')
      .eq('id', prospectId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching prospect status:', err.message);
    return null;
  }
}

/**
 * Get list of all prospects synced (for debugging/admin panel)
 * @returns {Promise<Array>}
 */
export async function getProspectsSync() {
  try {
    const { data, error } = await supabase
      .from('sales_prospects')
      .select('id, location_name, contact_person, pipeline_stage, next_action_date, follow_up_count, automation_status')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching prospects:', err.message);
    return [];
  }
}

export default { syncProspectToSupabase, getProspectStatus, getProspectsSync };
