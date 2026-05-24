import { createClient } from '@supabase/supabase-js';

// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com and create a free project
// 2. In your project go to Settings → API
// 3. Copy "Project URL" and "anon public" key below
// 4. Run the SQL in src/data/supabase_schema.sql in the Supabase SQL editor
// ============================================================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

const isConfigured = !SUPABASE_URL.includes('YOUR_PROJECT_ID');

export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Save a quiz score and upsert the user profile
export const saveScoreToSupabase = async (user, quizId, quizTitle, score, total) => {
  if (!isConfigured || !user) return; // Skip if not configured
  const percentage = Math.round((score / total) * 100);

  try {
    await supabase.from('profiles').upsert({
      id: user.uid, display_name: user.displayName, email: user.email, avatar_url: user.photoURL,
    }, { onConflict: 'id' });

    await supabase.from('quiz_scores').insert({
      user_id: user.uid, display_name: user.displayName, avatar_url: user.photoURL,
      quiz_id: quizId, quiz_title: quizTitle, score, total, percentage,
    });
  } catch (err) { console.error("Supabase Save Error:", err); }
};

// Fetch top scores for leaderboard
export const fetchLeaderboard = async () => {
  if (!isConfigured) {
    // Return mock leaderboard if not configured
    return [
      { display_name: "Alex Dev", quiz_title: "OOP: Fundamentals", percentage: 95 },
      { display_name: "Sarah Admin", quiz_title: "Database: Fundamentals", percentage: 88 },
      { display_name: "Local Tester", quiz_title: "Hardware Administration", percentage: 75 }
    ];
  }
  
  try {
    const { data, error } = await supabase
      .from('quiz_scores')
      .select('display_name, avatar_url, quiz_title, score, total, percentage, completed_at')
      .order('percentage', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase Fetch Error:", err);
    return [];
  }
};

// Subscribe to real-time leaderboard updates
export const subscribeToLeaderboard = (callback) => {
  if (!isConfigured) {
    // Return a dummy un-subscriber
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel('leaderboard_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_scores' }, callback)
    .subscribe();
};
