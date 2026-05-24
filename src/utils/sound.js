const createAudioContext = () => {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  return new window.AudioContext();
};

const playTone = (frequency, duration = 150, type = 'sine', volume = 0.12) => {
  const audioCtx = createAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  gain.gain.setTargetAtTime(0, audioCtx.currentTime + duration / 1000 * 0.6, 0.01);
  oscillator.stop(audioCtx.currentTime + duration / 1000);

  oscillator.onended = () => {
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  };
};

export const playSuccessSound = () => {
  playTone(520, 120, 'triangle');
  setTimeout(() => playTone(660, 120, 'triangle'), 130);
  setTimeout(() => playTone(780, 120, 'triangle'), 260);
};

export const playFailSound = () => {
  playTone(220, 180, 'sawtooth');
  setTimeout(() => playTone(176, 120, 'square'), 180);
};

export const playClickSound = () => {
  playTone(360, 80, 'square', 0.08);
};
