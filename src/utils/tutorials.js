const STORAGE_KEY = 'quiz_module_tutorials';

const parseStoredTutorials = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') || [];
  } catch {
    return [];
  }
};

const serializeStoredTutorials = (entries) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Unable to save tutorials', err);
  }
};

const getYouTubeVideoId = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
    /[?&]v=([A-Za-z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

export const getYouTubeEmbedUrl = (sourceUrl) => {
  const videoId = getYouTubeVideoId(sourceUrl);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
};

export const getStoredTutorials = () => {
  return parseStoredTutorials();
};

export const getTutorialsForModule = (moduleId) => {
  return parseStoredTutorials().filter((entry) => entry.moduleId === moduleId);
};

export const getTutorialForQuiz = (quizId) => {
  return parseStoredTutorials().find((entry) => entry.quizId === quizId) || null;
};

export const saveTutorialEntry = (tutorial) => {
  const entries = parseStoredTutorials();
  const existingIndex = entries.findIndex((entry) => entry.moduleId === tutorial.moduleId && entry.quizId === tutorial.quizId);
  const nextEntry = {
    moduleId: tutorial.moduleId,
    quizId: tutorial.quizId,
    videoEmbedUrl: tutorial.videoEmbedUrl,
    sourceUrl: tutorial.sourceUrl,
    savedAt: tutorial.savedAt || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = nextEntry;
  } else {
    entries.push(nextEntry);
  }

  serializeStoredTutorials(entries);
  return entries;
};

export const removeTutorialEntry = (moduleId, quizId) => {
  const entries = parseStoredTutorials().filter((entry) => !(entry.moduleId === moduleId && entry.quizId === quizId));
  serializeStoredTutorials(entries);
  return entries;
};
