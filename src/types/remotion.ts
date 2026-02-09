export interface VideoScene {
  id: string;
  title: string;
  content: string;
  durationInFrames: number;
  transition: 'fade' | 'slide' | 'zoom' | 'none';
  backgroundColor: string;
  textColor: string;
}

export interface VideoCompositionProps {
  title: string;
  scenes: VideoScene[];
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fps: number;
  totalDurationInFrames: number;
}
