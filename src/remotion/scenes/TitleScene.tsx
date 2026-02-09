import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';
import { VideoScene, VideoCompositionProps } from '@/types/remotion';
import { applyTransition, staggeredSpring, slideIn } from '../utils/animations';

interface TitleSceneProps {
  scene: VideoScene;
  colorScheme: VideoCompositionProps['colorScheme'];
}

export const TitleScene: React.FC<TitleSceneProps> = ({ scene, colorScheme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionOpacity = applyTransition(frame, durationInFrames, scene.transition);

  // Staggered animations
  const titleScale = staggeredSpring(frame, fps, 0, { damping: 12, stiffness: 80 });
  const titleRotate = interpolate(titleScale, [0, 1], [-2, 0]);

  const divider = slideIn(frame, fps, 12);
  const subtitle = slideIn(frame, fps, 20);

  // Accent line width animation
  const lineWidth = interpolate(
    staggeredSpring(frame, fps, 8, { damping: 18, stiffness: 60 }),
    [0, 1],
    [0, 120]
  );

  // Background gradient shift
  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 30], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${135 + gradientShift}deg, ${scene.backgroundColor} 0%, ${colorScheme.background} 60%, ${scene.backgroundColor} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: transitionOpacity,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundImage: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
          opacity: staggeredSpring(frame, fps, 5),
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: colorScheme.primary,
            transform: `scale(${titleScale}) rotate(${titleRotate}deg)`,
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: -1,
            maxWidth: '80%',
          }}
        >
          {scene.title}
        </h1>

        {/* Gradient divider */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundImage: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            borderRadius: 2,
            opacity: divider.opacity,
          }}
        />

        {/* Subtitle */}
        <p
          style={{
            fontSize: 30,
            color: scene.textColor,
            opacity: subtitle.opacity,
            transform: `translateY(${subtitle.translateY}px)`,
            textAlign: 'center',
            maxWidth: '65%',
            lineHeight: 1.6,
            fontWeight: 300,
            letterSpacing: 0.5,
          }}
        >
          {scene.content}
        </p>
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundImage: `linear-gradient(90deg, ${colorScheme.secondary}, ${colorScheme.primary})`,
          opacity: staggeredSpring(frame, fps, 10),
        }}
      />
    </AbsoluteFill>
  );
};
