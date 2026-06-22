import { supabase } from './supabaseClient.js';

export const sendEmail = async ({ to, subject, body, repName }) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, body, repName }
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return true;
};
