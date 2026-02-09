import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';
import { VideoScene, VideoCompositionProps } from '@/types/remotion';
import { applyTransition, staggeredSpring, slideIn } from '../utils/animations';

interface ContentSceneProps {
  scene: VideoScene;
  colorScheme: VideoCompositionProps['colorScheme'];
}

export const ContentScene: React.FC<ContentSceneProps> = ({
  scene,
  colorScheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionOpacity = applyTransition(frame, durationInFrames, scene.transition);

  // Staggered element animations
  const topLine = slideIn(frame, fps, 0, 20);
  const title = slideIn(frame, fps, 6, 30);
  const content = slideIn(frame, fps, 14, 25);

  // Left accent bar
  const barHeight = interpolate(
    staggeredSpring(frame, fps, 3, { damping: 20, stiffness: 60 }),
    [0, 1],
    [0, 80]
  );

  // Subtle background gradient movement
  const gradientPos = interpolate(frame, [0, durationInFrames], [40, 60], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(160deg, ${scene.backgroundColor} 0%, ${colorScheme.background} ${gradientPos}%, ${scene.backgroundColor} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 100,
        opacity: transitionOpacity,
      }}
    >
      {/* Side accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: '50%',
          width: 4,
          height: barHeight,
          backgroundImage: `linear-gradient(180deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
          borderRadius: 2,
          transform: 'translateY(-50%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 36,
          maxWidth: '75%',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: 50,
            height: 3,
            backgroundImage: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            borderRadius: 2,
            opacity: topLine.opacity,
            transform: `translateY(${topLine.translateY}px)`,
          }}
        />

        {/* Title */}
        <h2
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: colorScheme.primary,
            opacity: title.opacity,
            transform: `translateY(${title.translateY}px)`,
            textAlign: 'left',
            lineHeight: 1.25,
            letterSpacing: -0.5,
          }}
        >
          {scene.title}
        </h2>

        {/* Content */}
        <p
          style={{
            fontSize: 32,
            color: scene.textColor,
            opacity: content.opacity,
            transform: `translateY(${content.translateY}px)`,
            textAlign: 'left',
            lineHeight: 1.7,
            fontWeight: 300,
          }}
        >
          {scene.content}
        </p>
      </div>

      {/* Bottom-right page indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 60,
          opacity: interpolate(frame, [20, 35], [0, 0.4], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            width: 32,
            height: 3,
            backgroundImage: `linear-gradient(90deg, ${colorScheme.secondary}, ${colorScheme.primary})`,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
