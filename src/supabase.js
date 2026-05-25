import { createClient } from '@supabase/supabase-js';
import { modulesData, getQuizById } from './data/modules';

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

const getModuleForQuiz = (quizId) => {
  return modulesData.find((module) => module.quizzes.includes(quizId));
};

const normalizeLeaderboardRow = (row) => {
  const displayName = row.display_name || row.displayName || row.email || 'Student';
  const quizId = row.quiz_id || row.quizId || '';
  const module = getModuleForQuiz(quizId) || {};

  return {
    user_id: row.user_id || row.userId || '',
    display_name: displayName,
    avatar_url: row.avatar_url || row.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff`,
    email: row.email || '',
    quiz_id: quizId,
    quiz_title: row.quiz_title || row.quizTitle || module.quiz_title || '',
    module_id: row.module_id || row.moduleId || module.id || 'module-unknown',
    module_title: row.module_title || row.moduleTitle || module.title || 'Unknown Module',
    score: Number(row.score) || 0,
    total: Number(row.total) || 0,
    percentage: Number(row.percentage) || 0,
    completed_at: row.completed_at || row.completedAt || ''
  };
};

const aggregateLeaderboardRows = (rows) => {
  const moduleBuckets = {};

  rows.forEach((row) => {
    const normalized = normalizeLeaderboardRow(row);
    const moduleKey = normalized.module_id || 'module-unknown';
    const completedAt = normalized.completed_at || '';

    if (!moduleBuckets[moduleKey]) {
      moduleBuckets[moduleKey] = {
        module_id: normalized.module_id,
        module_title: normalized.module_title,
        rows: {},
      };
    }

    const bucket = moduleBuckets[moduleKey].rows;
    const userKey = normalized.user_id || normalized.email || normalized.display_name;

    if (!bucket[userKey]) {
      bucket[userKey] = {
        user_id: normalized.user_id,
        display_name: normalized.display_name,
        avatar_url: normalized.avatar_url,
        email: normalized.email,
        module_id: normalized.module_id,
        module_title: normalized.module_title,
        best_percentage: normalized.percentage,
        best_score: normalized.score,
        best_total: normalized.total,
        quizzes_completed: 1,
        latest_percentage: normalized.percentage,
        latest_quiz_title: normalized.quiz_title,
        latest_played: completedAt,
      };
      return;
    }

    bucket[userKey].quizzes_completed += 1;

    if (normalized.percentage > bucket[userKey].best_percentage) {
      bucket[userKey].best_percentage = normalized.percentage;
      bucket[userKey].best_score = normalized.score;
      bucket[userKey].best_total = normalized.total;
    }

    if (completedAt && (!bucket[userKey].latest_played || completedAt > bucket[userKey].latest_played)) {
      bucket[userKey].latest_played = completedAt;
      bucket[userKey].latest_percentage = normalized.percentage;
      bucket[userKey].latest_quiz_title = normalized.quiz_title;
    }
  });

  return Object.values(moduleBuckets).map((module) => ({
    module_id: module.module_id,
    module_title: module.module_title,
    rows: Object.values(module.rows)
      .sort((a, b) => {
        if (b.best_percentage !== a.best_percentage) return b.best_percentage - a.best_percentage;
        if (b.quizzes_completed !== a.quizzes_completed) return b.quizzes_completed - a.quizzes_completed;
        return (b.latest_played || '') > (a.latest_played || '') ? 1 : -1;
      })
      .slice(0, 20),
  }));
};

const buildLocalLeaderboard = () => {
  const accounts = loadLocalAccounts();
  const rows = [];

  accounts.forEach((account) => {
    const progress = loadLocalProgress(account.id);
    Object.entries(progress).forEach(([quizId, entry]) => {
      if (!entry || typeof entry.percentage !== 'number') return;
      const quiz = getQuizById(quizId);
      const module = getModuleForQuiz(quizId);

      rows.push({
        user_id: account.id,
        display_name: account.displayName || account.email || 'Student',
        avatar_url: account.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.displayName || account.email || 'Student')}&background=4f46e5&color=fff`,
        email: account.email,
        quiz_id: quizId,
        quiz_title: quiz?.title || quizId,
        module_id: module?.id || 'module-unknown',
        module_title: module?.title || 'Unknown Module',
        score: entry.score,
        total: entry.total,
        percentage: entry.percentage,
        completed_at: entry.completedAt || '',
      });
    });
  });

  return aggregateLeaderboardRows(rows);
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
  const module = getModuleForQuiz(quizId) || {};
  const completedAt = new Date().toISOString();

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
      module_id: module.id || '',
      module_title: module.title || '',
      score,
      total,
      percentage,
      completed_at: completedAt,
    });
  } catch (err) {
    console.error('Supabase Save Error:', err);
  }
};

export const fetchLeaderboard = async () => {
  const localLeaderboard = buildLocalLeaderboard();
  if (!isConfigured) {
    return localLeaderboard.length > 0
      ? localLeaderboard
      : [
          {
            module_id: 'module-oop',
            module_title: 'OOP',
            rows: [
              { display_name: 'Alex Dev', avatar_url: 'https://ui-avatars.com/api/?name=Alex+Dev&background=4f46e5&color=fff', best_percentage: 95, quizzes_completed: 3, latest_percentage: 95, latest_quiz_title: 'OOP: Fundamentals', latest_played: '' }
            ]
          },
          {
            module_id: 'module-database',
            module_title: 'Database',
            rows: [
              { display_name: 'Sarah Admin', avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Admin&background=4f46e5&color=fff', best_percentage: 88, quizzes_completed: 2, latest_percentage: 88, latest_quiz_title: 'Database: Fundamentals', latest_played: '' }
            ]
          },
          {
            module_id: 'module-hardware',
            module_title: 'Hardware',
            rows: [
              { display_name: 'Local Tester', avatar_url: 'https://ui-avatars.com/api/?name=Local+Tester&background=4f46e5&color=fff', best_percentage: 75, quizzes_completed: 1, latest_percentage: 75, latest_quiz_title: 'Hardware Administration', latest_played: '' }
            ]
          }
        ];
  }

  try {
    const { data, error } = await supabase
      .from('quiz_scores')
      .select('user_id, display_name, avatar_url, email, quiz_id, quiz_title, module_id, module_title, score, total, percentage, completed_at')
      .limit(500);

    if (error) throw error;
    const remoteLeaderboard = aggregateLeaderboardRows(data || []);
    return remoteLeaderboard.length > 0 ? remoteLeaderboard : localLeaderboard;
  } catch (err) {
    console.error('Supabase Fetch Error:', err);
    return localLeaderboard.length > 0 ? localLeaderboard : [
      {
        module_id: 'module-oop',
        module_title: 'OOP',
        rows: [
          { display_name: 'Alex Dev', avatar_url: 'https://ui-avatars.com/api/?name=Alex+Dev&background=4f46e5&color=fff', best_percentage: 95, quizzes_completed: 3, latest_percentage: 95, latest_quiz_title: 'OOP: Fundamentals', latest_played: '' }
        ]
      },
      {
        module_id: 'module-database',
        module_title: 'Database',
        rows: [
          { display_name: 'Sarah Admin', avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Admin&background=4f46e5&color=fff', best_percentage: 88, quizzes_completed: 2, latest_percentage: 88, latest_quiz_title: 'Database: Fundamentals', latest_played: '' }
        ]
      },
      {
        module_id: 'module-hardware',
        module_title: 'Hardware',
        rows: [
          { display_name: 'Local Tester', avatar_url: 'https://ui-avatars.com/api/?name=Local+Tester&background=4f46e5&color=fff', best_percentage: 75, quizzes_completed: 1, latest_percentage: 75, latest_quiz_title: 'Hardware Administration', latest_played: '' }
        ]
      }
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

const TUTORIALS_TABLE = 'module_tutorials';

const parseLocalTutorials = () => {
  try {
    return JSON.parse(localStorage.getItem('quiz_module_tutorials') || '[]') || [];
  } catch {
    return [];
  }
};

const normalizeTutorialRow = (row) => ({
  moduleId: row.module_id || row.moduleId,
  quizId: row.quiz_id || row.quizId,
  sourceUrl: row.source_url || row.sourceUrl,
  videoEmbedUrl: row.video_embed_url || row.videoEmbedUrl,
  savedAt: row.saved_at || row.savedAt || '',
});

export const getTutorialsFromSupabase = async () => {
  const localData = parseLocalTutorials().map(normalizeTutorialRow);

  if (!isConfigured) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from(TUTORIALS_TABLE).select('*');
    if (error) throw error;
    const remote = (data || []).map(normalizeTutorialRow);
    return remote.length > 0 ? remote : localData;
  } catch (err) {
    console.error('getTutorialsFromSupabase error', err);
    return localData;
  }
};

export const getTutorialsForModuleFromSupabase = async (moduleId) => {
  const tutorials = await getTutorialsFromSupabase();
  return tutorials.filter((entry) => entry.moduleId === moduleId);
};

export const saveTutorialToSupabase = async (tutorial) => {
  const entry = {
    module_id: tutorial.moduleId,
    quiz_id: tutorial.quizId,
    source_url: tutorial.sourceUrl,
    video_embed_url: tutorial.videoEmbedUrl,
    saved_at: tutorial.savedAt || new Date().toISOString(),
  };

  const saveLocal = () => {
    const stored = parseLocalTutorials();
    const existingIndex = stored.findIndex((item) => item.module_id === entry.module_id && item.quiz_id === entry.quiz_id);
    if (existingIndex >= 0) {
      stored[existingIndex] = entry;
    } else {
      stored.push(entry);
    }
    localStorage.setItem('quiz_module_tutorials', JSON.stringify(stored));
    return stored.map(normalizeTutorialRow);
  };

  if (!isConfigured) {
    return saveLocal();
  }

  try {
    const { error } = await supabase.from(TUTORIALS_TABLE).upsert([entry], { onConflict: ['module_id', 'quiz_id'] });
    if (error) throw error;
    return await getTutorialsFromSupabase();
  } catch (err) {
    console.error('saveTutorialToSupabase error', err);
    return saveLocal();
  }
};

export const deleteTutorialFromSupabase = async (moduleId, quizId) => {
  const deleteLocal = () => {
    const stored = parseLocalTutorials().filter((item) => !(item.module_id === moduleId && item.quiz_id === quizId));
    localStorage.setItem('quiz_module_tutorials', JSON.stringify(stored));
    return stored.map(normalizeTutorialRow);
  };

  if (!isConfigured) {
    return deleteLocal();
  }

  try {
    const { error } = await supabase.from(TUTORIALS_TABLE).delete().match({ module_id: moduleId, quiz_id: quizId });
    if (error) throw error;
    return await getTutorialsFromSupabase();
  } catch (err) {
    console.error('deleteTutorialFromSupabase error', err);
    return deleteLocal();
  }
};
