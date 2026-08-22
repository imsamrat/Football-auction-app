import { useCallback, useRef } from 'react';

export const useSound = () => {
  const audioContextRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency, duration = 0.15, type = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  }, [getAudioContext]);

  const playBidSound = useCallback(() => {
    playTone(880, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.2), 100);
  }, [playTone]);

  const playGoingOnceSound = useCallback(() => {
    playTone(660, 0.3, 'sine', 0.3);
  }, [playTone]);

  const playGoingTwiceSound = useCallback(() => {
    playTone(660, 0.2, 'sine', 0.3);
    setTimeout(() => playTone(660, 0.2, 'sine', 0.3), 250);
  }, [playTone]);

  const playFinalCallSound = useCallback(() => {
    playTone(880, 0.15, 'square', 0.2);
    setTimeout(() => playTone(880, 0.15, 'square', 0.2), 200);
    setTimeout(() => playTone(880, 0.15, 'square', 0.2), 400);
  }, [playTone]);

  const playSoldSound = useCallback(() => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg');
      audio.volume = 0.6;
      audio.play().then(() => {
        // Cut the sound off after 1.5 seconds so it doesn't ring endlessly
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 1500);
      }).catch(() => {
        // Fallback to beeps if audio fails to play
        playTone(523, 0.15, 'sine', 0.3);
        setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 150);
        setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 300);
        setTimeout(() => playTone(1047, 0.3, 'sine', 0.4), 450);
      });
    } catch (e) {
      // Ignore
    }
  }, [playTone]);

  const playStartSound = useCallback(() => {
    playTone(440, 0.2, 'sine', 0.3);
    setTimeout(() => playTone(660, 0.2, 'sine', 0.3), 200);
    setTimeout(() => playTone(880, 0.3, 'sine', 0.3), 400);
  }, [playTone]);

  const playTickSound = useCallback(() => {
    playTone(800, 0.05, 'sine', 0.05);
  }, [playTone]);

  return { playBidSound, playGoingOnceSound, playGoingTwiceSound, playFinalCallSound, playSoldSound, playStartSound, playTickSound };
};
