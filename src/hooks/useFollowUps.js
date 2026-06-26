import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient.js';

function addBusinessDays(from, days) {
  if (days === 0) return from;
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

const STAGE_GAPS_NEW = { 1: 0, 2: 2, 3: 5, 4: 14, 5: 30 };
const STAGE_GAPS_REENGAGE = { 1: 0, 2: 5, 3: 14, 4: 30 };

export function useFollowUps() {
  const [today, setToday] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [warm, setWarm] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFollowups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending + replied follow-ups
      const { data: fls, error: fErr } = await supabase
        .from('belarro_v4_follow_up')
        .select('*')
        .in('status', ['pending', 'replied'])
        .neq('status', 'skipped')
        .order('due_date', { ascending: true });

      if (fErr) throw fErr;
      if (!fls || fls.length === 0) {
        setToday([]); setUpcoming([]); setWarm([]);
        return;
      }

      const locationIds = [...new Set(fls.map(f => f.location_id).filter(Boolean))];
      if (locationIds.length === 0) { setToday([]); setUpcoming([]); setWarm([]); return; }

      const { data: locs, error: lErr } = await supabase
        .from('locations')
        .select('id,location_name,contact_person,direct_phone,business_phone,direct_email,language,pipeline_stage,interest_level,timestamp,created_at,sales_rep')
        .in('id', locationIds)
        .neq('archived', 'YES');

      if (lErr) throw lErr;
      const locMap = new Map((locs || []).map(l => [l.id, l]));

      // Warm: replied status
      const warmItems = fls
        .filter(f => f.status === 'replied')
        .map(f => ({ ...f, stage: f.stage || f.follow_up_number || 1, loc: locMap.get(f.location_id) }))
        .filter(f => f.loc && f.loc.pipeline_stage !== 'active');

      // Pending: keep only lowest stage per location
      const nextPerLoc = new Map();
      for (const f of fls.filter(f => f.status === 'pending')) {
        const loc = locMap.get(f.location_id);
        if (!loc) continue;
        if (loc.pipeline_stage === 'active' || loc.pipeline_stage === 'snoozed') continue;
        const stage = f.stage || f.follow_up_number || 1;
        const existing = nextPerLoc.get(f.location_id);
        if (!existing || stage < (existing.stage || existing.follow_up_number || 1)) {
          nextPerLoc.set(f.location_id, { ...f, stage, loc });
        }
      }

      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const all = Array.from(nextPerLoc.values());

      setToday(all.filter(f => new Date(f.due_date) <= todayEnd).sort((a, b) => new Date(b.due_date) - new Date(a.due_date)));
      setUpcoming(all.filter(f => new Date(f.due_date) > todayEnd).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
      setWarm(warmItems.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));

    } catch (err) {
      console.error('useFollowUps error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFollowups(); }, [fetchFollowups]);

  // Keep followups as today for backward compat
  const followups = today;

  const markSent = useCallback(async (followupId, via) => {
    const now = new Date();
    // Mark current stage done
    await supabase
      .from('belarro_v4_follow_up')
      .update({ status: 'completed', sent_via: via, sent_date: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', followupId);

    // Get current follow-up to find next stage
    const { data: cur } = await supabase
      .from('belarro_v4_follow_up')
      .select('*')
      .eq('id', followupId)
      .single();

    if (cur && cur.location_id) {
      const nextStage = (cur.stage || cur.follow_up_number || 1) + 1;
      const { data: next } = await supabase
        .from('belarro_v4_follow_up')
        .select('id,stage,follow_up_days')
        .eq('location_id', cur.location_id)
        .eq('stage', nextStage)
        .eq('status', 'pending')
        .single();

      if (next) {
        const days = STAGE_GAPS_NEW[nextStage] ?? next.follow_up_days ?? 2;
        const newDue = addBusinessDays(now, days);
        await supabase
          .from('belarro_v4_follow_up')
          .update({ due_date: newDue.toISOString(), updated_at: now.toISOString() })
          .eq('id', next.id);
      }
    }

    fetchFollowups();
  }, [fetchFollowups]);

  return { followups, today, upcoming, warm, loading, error, refetch: fetchFollowups, markSent };
}
