let users = [];

export function addUser(user) {
  const existing = users.find(u => u.email === user.email);
  if (existing) return;
  users.push({ ...user, uid: Date.now().toString(), restricted: false });
}

export function getAllUsers() {
  return users;
}

export function removeUser(uid) {
  users = users.filter(u => u.uid !== uid);
}

export function toggleRestrictUser(uid) {
  users = users.map(u => (u.uid === uid ? { ...u, restricted: !u.restricted } : u));
}

export function isAdmin(email) {
  // For mock purposes, any email ending with '@example.com' is admin
  return email && email.endsWith('@example.com');
}
