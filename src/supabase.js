import { createClient } from '@supabase/supabase-js';
import { getQuizById } from './data/modules';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const isConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const ADMIN_EMAIL = 'joshuamujakari15@gmail.com';

const ACCOUNTS_KEY = 'quiz_accounts';
const QUIZ_PROGRESS_PREFIX = 'quiz_progress_';

const loadLocalAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') || [];
  } catch {
    return [];
  }
};

const loadLocalProgress = (userId) => {
  if (!userId) return {};
  try {
    return JSON.parse(localStorage.getItem(`${QUIZ_PROGRESS_PREFIX}${userId}`) || '{}') || {};
  } catch {
    return {};
  }
};

const buildLocalLeaderboard = () => {
  const accounts = loadLocalAccounts();
  const leaderboard = [];

  accounts.forEach((account) => {
    const progress = loadLocalProgress(account.id);
    Object.entries(progress).forEach(([quizId, entry]) => {
      const quiz = getQuizById(quizId);
      if (!entry || typeof entry.percentage !== 'number') return;
      leaderboard.push({
        user_id: account.id,
        display_name: account.displayName || account.email || 'Student',
        email: account.email,
        avatar_url: account.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.displayName || account.email || 'Student')}&background=4f46e5&color=fff`,
        quiz_title: quiz?.title || quizId || 'Quiz attempt',
        score: entry.score,
        total: entry.total,
        percentage: entry.percentage,
        completed_at: entry.timestamp || ''
      });
    });
  });

  return leaderboard
    .reduce((acc, row) => {
      const key = row.user_id || row.email || row.display_name;
      if (!acc[key] || row.percentage > acc[key].percentage) {
        acc[key] = row;
      }
      return acc;
    }, {});
};

const normalizeUser = (supabaseUser) => {
  if (!supabaseUser) return null;
  const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0];
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    displayName: fullName,
    avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=fff`,
    role: supabaseUser.email === ADMIN_EMAIL ? 'admin' : 'student',
  };
};

export const signInWithGoogle = async () => {
  if (!isConfigured) throw new Error('Supabase is not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
};

export const handleOAuthRedirect = async () => {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
    if (error) {
      console.error('Supabase OAuth redirect error:', error);
      return null;
    }

    const user = normalizeUser(data?.session?.user);
    if (user) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return user;
  } catch (err) {
    console.error('Supabase redirect handling failed:', err);
    return null;
  }
};

export const getSessionUser = async () => {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase session error:', error);
      return null;
    }
    return normalizeUser(data?.session?.user);
  } catch (err) {
    console.error('Supabase session lookup failed:', err);
    return null;
  }
};

export const signOutUser = async () => {
  if (!isConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Supabase sign out error:', error);
};

export const saveScoreToSupabase = async (user, quizId, quizTitle, score, total) => {
  if (!isConfigured || !user) return;
  const userId = user.id || user.uid;
  const percentage = Math.round((score / total) * 100);

  try {
    await supabase.from('profiles').upsert({
      id: userId,
      display_name: user.displayName,
      email: user.email,
      avatar_url: user.avatar_url || user.photoURL,
    }, { onConflict: 'id' });

    await supabase.from('quiz_scores').insert({
      user_id: userId,
      display_name: user.displayName,
      email: user.email,
      avatar_url: user.avatar_url || user.photoURL,
      quiz_id: quizId,
      quiz_title: quizTitle,
      score,
      total,
      percentage,
    });
  } catch (err) {
    console.error('Supabase Save Error:', err);
  }
};

export const fetchLeaderboard = async () => {
  const localLeaderboard = Object.values(buildLocalLeaderboard()).sort((a, b) => b.percentage - a.percentage).slice(0, 50);
  if (!isConfigured) {
    return localLeaderboard.length > 0
      ? localLeaderboard
      : [
          { display_name: 'Alex Dev', quiz_title: 'OOP: Fundamentals', percentage: 95 },
          { display_name: 'Sarah Admin', quiz_title: 'Database: Fundamentals', percentage: 88 },
          { display_name: 'Local Tester', quiz_title: 'Hardware Administration', percentage: 75 }
        ];
  }

  try {
    const { data, error } = await supabase
      .from('quiz_scores')
      .select('user_id, display_name, avatar_url, email, quiz_title, score, total, percentage, completed_at')
      .order('percentage', { ascending: false })
      .limit(100);

    if (error) throw error;
    const normalized = (data || []).map((row) => ({
      ...row,
      percentage: Number(row.percentage) || 0,
      display_name: row.display_name || row.email || 'Student',
      avatar_url: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.display_name || 'Student')}&background=4f46e5&color=fff`,
      quiz_title: row.quiz_title || 'Quiz attempt',
    }));

    const grouped = normalized.reduce((acc, row) => {
      const key = row.user_id || row.email || row.display_name;
      if (!acc[key] || row.percentage > acc[key].percentage) {
        acc[key] = row;
      }
      return acc;
    }, {});

    const remoteLeaderboard = Object.values(grouped).sort((a, b) => b.percentage - a.percentage).slice(0, 50);
    return remoteLeaderboard.length > 0 ? remoteLeaderboard : localLeaderboard;
  } catch (err) {
    console.error('Supabase Fetch Error:', err);
    return localLeaderboard.length > 0 ? localLeaderboard : [
      { display_name: 'Alex Dev', quiz_title: 'OOP: Fundamentals', percentage: 95 },
      { display_name: 'Sarah Admin', quiz_title: 'Database: Fundamentals', percentage: 88 },
      { display_name: 'Local Tester', quiz_title: 'Hardware Administration', percentage: 75 }
    ];
  }
};

export const subscribeToLeaderboard = (callback) => {
  if (!isConfigured) {
    return { unsubscribe: () => {} };
  }

  const wrappedCallback = (payload) => {
    const record = payload?.new || payload?.record || payload?.event?.data?.new || payload?.event?.data?.record;
    if (!record) return;
    callback(record);
  };

  return supabase
    .channel('leaderboard_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_scores' }, wrappedCallback)
    .subscribe();
};

// Admin helpers
export const deleteScore = async (criteria = {}) => {
  if (!isConfigured) return { error: 'Supabase not configured' };
  try {
    const { error } = await supabase.from('quiz_scores').delete().match(criteria);
    return { error };
  } catch (err) {
    console.error('deleteScore error', err);
    return { error: err };
  }
};

export const deleteUser = async (userId) => {
  if (!isConfigured) return { error: 'Supabase not configured' };
  try {
    // remove user's quiz scores then profile
    const { error: e1 } = await supabase.from('quiz_scores').delete().eq('user_id', userId);
    const { error: e2 } = await supabase.from('profiles').delete().eq('id', userId);
    return { error: e1 || e2 };
  } catch (err) {
    console.error('deleteUser error', err);
    return { error: err };
  }
};

export const fetchProfiles = async () => {
  if (!isConfigured) return [];
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(500);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchProfiles error', err);
    return [];
  }
};
