import { supabase } from '../supabase';

const ACCOUNTS_KEY = 'quiz_accounts';
const USER_KEY = 'quiz_user';
const ADMIN_EMAIL = 'joshuamujakari15@gmail.com';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const loadAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') || [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const writeCurrentUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
};

const createProfileInSupabase = async (user) => {
  if (!supabase) return;

  try {
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: user.displayName,
      email: user.email,
      avatar_url: user.avatar_url,
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('Supabase profile save error:', err);
  }
};

export const registerUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Please provide your email and password.');
  }

  const accounts = loadAccounts();
  const existing = accounts.find((account) => account.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please login instead.');
  }

  const displayName = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, ' ').trim() || 'Student';
  const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff`;
  const newUser = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: normalizedEmail,
    password,
    displayName,
    avatar_url,
    role: 'student',
    isAdmin: false,
  };

  accounts.push(newUser);
  saveAccounts(accounts);
  writeCurrentUser(newUser);
  await createProfileInSupabase(newUser);
  return newUser;
};

export const loginUser = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const accounts = loadAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);

  if (!account) {
    throw new Error('No account found for this email. Please register first.');
  }
  if (account.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  writeCurrentUser(account);
  return account;
};
