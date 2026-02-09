import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { VideoCompositionProps } from '@/types/remotion';
import { TitleScene } from './scenes/TitleScene';
import { ContentScene } from './scenes/ContentScene';
import { OutroScene } from './scenes/OutroScene';

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes,
  colorScheme,
}) => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colorScheme.background }}>
      {scenes.map((scene, index) => {
        const from = currentFrame;
        currentFrame += scene.durationInFrames;

        if (index === 0) {
          return (
            <Sequence
              key={scene.id}
              from={from}
              durationInFrames={scene.durationInFrames}
            >
              <TitleScene scene={scene} colorScheme={colorScheme} />
            </Sequence>
          );
        }

        if (index === scenes.length - 1) {
          return (
            <Sequence
              key={scene.id}
              from={from}
              durationInFrames={scene.durationInFrames}
            >
              <OutroScene scene={scene} colorScheme={colorScheme} />
            </Sequence>
          );
        }

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationInFrames}
          >
            <ContentScene scene={scene} colorScheme={colorScheme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
