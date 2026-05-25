// In a real app, this would be stored in Firebase Firestore under the user's document.
// For this prototype, we use localStorage to persist it across reloads.

export const getProgress = (userId) => {
  const data = localStorage.getItem(`quiz_progress_${userId}`);
  if (data) {
    return JSON.parse(data);
  }
  return {}; // Returns an object like { "hw-lo1-repair": { score: 18, passed: true } }
};

export const PASS_THRESHOLD = 85;

export const saveProgress = (userId, quizId, score, total) => {
  const currentProgress = getProgress(userId);
  const percentage = (score / total) * 100;
  const passed = percentage >= PASS_THRESHOLD; // 85% to pass and unlock next
  const completedAt = new Date().toISOString();

  // Update if it's their first time, a higher score, or the same score on a later attempt.
  if (!currentProgress[quizId] || currentProgress[quizId].score <= score) {
    currentProgress[quizId] = { score, total, percentage, passed, completedAt };
    localStorage.setItem(`quiz_progress_${userId}`, JSON.stringify(currentProgress));
  }
};
