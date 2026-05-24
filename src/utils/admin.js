export function isAdmin(userOrEmail) {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === 'string') {
    return userOrEmail.toLowerCase() === 'joshuamujakari15@gmail.com';
  }
  return userOrEmail?.isAdmin === true || userOrEmail?.email?.toLowerCase() === 'joshuamujakari15@gmail.com';
}
