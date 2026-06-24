/**
 * Sync Saletracker prospect to Belarro Supabase
 * Called when Ron saves a contact after visiting a restaurant
 * Uses edge function with service-role key to bypass RLS policies
 */

/**
 * Sync a prospect from Saletracker to Belarro automation system
 * Calls edge function (service-role backed) to bypass RLS policies
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
    visitDate = new Date().toISOString(),
    salesRep = ''
  } = prospectData;

  try {
    // Validate required fields
    if (!locationName || !contactPerson || !directPhone) {
      return {
        success: false,
        error: 'Missing required fields: locationName, contactPerson, directPhone'
      };
    }

    // Call edge function to sync prospect to restaurant in Belarro
    // This creates a restaurant record automatically when a prospect is marked as client
    const response = await fetch(
      'https://qciccimnfvloklqlhvvm.supabase.co/functions/v1/sync-prospect-to-restaurant',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationName,
          contactPerson,
          directPhone,
          directEmail,
          language: (language || 'DE').toUpperCase(),
          visitNotes,
          sampleGiven,
          visitDate,
          salesRep
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        id: data.id,
        locationName,
        contactPerson
      };
    } else {
      return {
        success: false,
        error: data.error || 'Unknown sync error'
      };
    }
  } catch (err) {
    console.error('Sync error:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

export default { syncProspectToSupabase };
