import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { VideoCompositionProps } from '@/types/remotion';

export const Root: React.FC = () => {
  const defaultProps: VideoCompositionProps = {
    title: 'Video Studio',
    scenes: [
      {
        id: 'scene-1',
        title: 'Welcome',
        content: 'Video Studio에 오신 것을 환영합니다',
        durationInFrames: 90,
        transition: 'fade',
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
      },
    ],
    colorScheme: {
      primary: '#4a90d9',
      secondary: '#50c878',
      background: '#0a0a1a',
      text: '#ffffff',
    },
    fps: 30,
    totalDurationInFrames: 90,
  };

  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition as unknown as React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>}
      durationInFrames={defaultProps.totalDurationInFrames}
      fps={defaultProps.fps}
      width={1920}
      height={1080}
      defaultProps={defaultProps as unknown as Record<string, unknown>}
    />
  );
};
