import { useEffect, useRef } from 'react';

const SOUND_FILES = {
  click_1:   '/sounds/key_click_1.wav',
  click_2:   '/sounds/key_click_2.wav',
  click_3:   '/sounds/key_click_3.wav',
  click_4:   '/sounds/key_click_4.wav',
  enter:     '/sounds/key_enter.wav',
  backspace: '/sounds/key_backspace.wav',
};

/**
 * Attaches a global keydown listener that plays the correct WAV file
 * depending on the chosen sound profile.
 *
 * @param {string|null} soundProfile – one of the SOUND_FILES keys ('click_1'…'click_4') or null/none
 */
export function useKeyboardSound(soundProfile) {
  // Pre-load all audio objects so playback is instant
  const audioMap = useRef({});

  useEffect(() => {
    Object.entries(SOUND_FILES).forEach(([key, src]) => {
      const a = new Audio(src);
      a.volume = 0.6;
      audioMap.current[key] = a;
    });
  }, []);

  useEffect(() => {
    if (!soundProfile || soundProfile === 'none') return;

    const play = (key) => {
      const a = audioMap.current[key];
      if (!a) return;
      a.currentTime = 0;
      a.play().catch(() => {}); // ignore autoplay policy errors
    };

    const handler = (e) => {
      if (e.key === 'Enter') {
        play('enter');
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        play('backspace');
      } else if (e.key.length === 1) {
        // Use the chosen click profile for all regular keys
        play(soundProfile);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [soundProfile]);
}

export { SOUND_FILES };
