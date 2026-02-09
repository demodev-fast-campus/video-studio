import { interpolate, spring } from 'remotion';

export function applyTransition(
  frame: number,
  durationInFrames: number,
  transition: 'fade' | 'slide' | 'zoom' | 'none'
): number {
  if (transition === 'none') return 1;

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return fadeIn * fadeOut;
}

export function staggeredSpring(
  frame: number,
  fps: number,
  delay: number,
  config?: { damping?: number; stiffness?: number }
) {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {
      damping: config?.damping ?? 14,
      stiffness: config?.stiffness ?? 100,
    },
  });
}

export function slideIn(
  frame: number,
  fps: number,
  delay: number,
  distance: number = 40
) {
  const progress = staggeredSpring(frame, fps, delay, {
    damping: 16,
    stiffness: 80,
  });
  const translateY = interpolate(progress, [0, 1], [distance, 0]);
  return { translateY, opacity: progress };
}
