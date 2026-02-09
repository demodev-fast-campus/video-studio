import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';
import { VideoScene, VideoCompositionProps } from '@/types/remotion';
import { applyTransition, staggeredSpring, slideIn } from '../utils/animations';

interface OutroSceneProps {
  scene: VideoScene;
  colorScheme: VideoCompositionProps['colorScheme'];
}

export const OutroScene: React.FC<OutroSceneProps> = ({ scene, colorScheme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionOpacity = applyTransition(frame, durationInFrames, scene.transition);

  // Staggered entrance
  const title = slideIn(frame, fps, 0, 30);
  const content = slideIn(frame, fps, 10, 25);
  const badge = slideIn(frame, fps, 20, 20);

  // Scale entrance for the whole card
  const cardScale = staggeredSpring(frame, fps, 0, { damping: 14, stiffness: 60 });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Gradient rotation
  const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 165], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${gradientAngle}deg, ${scene.backgroundColor} 0%, ${colorScheme.background} 50%, ${scene.backgroundColor} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: transitionOpacity * fadeOut,
      }}
    >
      {/* Top + bottom gradient bars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundImage: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary}, ${colorScheme.primary})`,
          opacity: staggeredSpring(frame, fps, 5),
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundImage: `linear-gradient(90deg, ${colorScheme.secondary}, ${colorScheme.primary}, ${colorScheme.secondary})`,
          opacity: staggeredSpring(frame, fps, 8),
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          transform: `scale(${cardScale})`,
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: colorScheme.primary,
            textAlign: 'center',
            opacity: title.opacity,
            transform: `translateY(${title.translateY}px)`,
            letterSpacing: -0.5,
          }}
        >
          {scene.title}
        </h2>

        {/* Divider */}
        <div
          style={{
            width: interpolate(
              staggeredSpring(frame, fps, 8),
              [0, 1],
              [0, 80]
            ),
            height: 3,
            backgroundImage: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            borderRadius: 2,
          }}
        />

        {/* Content */}
        <p
          style={{
            fontSize: 26,
            color: scene.textColor,
            textAlign: 'center',
            maxWidth: '55%',
            lineHeight: 1.6,
            opacity: content.opacity,
            transform: `translateY(${content.translateY}px)`,
            fontWeight: 300,
          }}
        >
          {scene.content}
        </p>

        {/* Badge */}
        <div
          style={{
            marginTop: 16,
            fontSize: 15,
            color: colorScheme.secondary,
            opacity: badge.opacity * 0.6,
            transform: `translateY(${badge.translateY}px)`,
            letterSpacing: 2,
            fontWeight: 500,
            textTransform: 'uppercase' as const,
          }}
        >
          Made with Video Studio
        </div>
      </div>
    </AbsoluteFill>
  );
};
