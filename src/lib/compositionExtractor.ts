import { VideoCompositionProps, VideoScene } from '@/types/remotion';

/**
 * 에이전트 응답에서 VideoCompositionProps JSON을 추출합니다.
 */
export function extractCompositionProps(content: string): VideoCompositionProps | null {
  // ```json 블록에서 JSON 추출
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (validateCompositionProps(parsed)) {
        return normalizeProps(parsed);
      }
    } catch {
      continue;
    }
  }

  // ``` 블록 없이 JSON 직접 파싱 시도
  try {
    const jsonMatch = content.match(/\{[\s\S]*"scenes"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (validateCompositionProps(parsed)) {
        return normalizeProps(parsed);
      }
    }
  } catch {
    // 파싱 실패
  }

  return null;
}

/**
 * VideoCompositionProps 유효성 검증
 */
function validateCompositionProps(data: unknown): data is VideoCompositionProps {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  if (typeof obj.title !== 'string') return false;
  if (!Array.isArray(obj.scenes) || obj.scenes.length === 0) return false;
  if (!obj.colorScheme || typeof obj.colorScheme !== 'object') return false;

  const colorScheme = obj.colorScheme as Record<string, unknown>;
  if (
    typeof colorScheme.primary !== 'string' ||
    typeof colorScheme.background !== 'string' ||
    typeof colorScheme.text !== 'string'
  ) {
    return false;
  }

  // 각 장면 검증
  for (const scene of obj.scenes as unknown[]) {
    if (!scene || typeof scene !== 'object') return false;
    const s = scene as Record<string, unknown>;
    if (typeof s.title !== 'string' || typeof s.content !== 'string') return false;
    if (typeof s.durationInFrames !== 'number' || s.durationInFrames <= 0) return false;
  }

  return true;
}

/**
 * Props 정규화 (누락된 필드 채우기)
 */
function normalizeProps(props: VideoCompositionProps): VideoCompositionProps {
  const scenes: VideoScene[] = props.scenes.map((scene, index) => ({
    id: scene.id || `scene-${index + 1}`,
    title: scene.title,
    content: scene.content,
    durationInFrames: scene.durationInFrames || 90,
    transition: scene.transition || 'fade',
    backgroundColor: scene.backgroundColor || props.colorScheme.background,
    textColor: scene.textColor || props.colorScheme.text,
  }));

  const totalDurationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  return {
    title: props.title,
    scenes,
    colorScheme: {
      primary: props.colorScheme.primary,
      secondary: props.colorScheme.secondary || props.colorScheme.primary,
      background: props.colorScheme.background,
      text: props.colorScheme.text,
    },
    fps: props.fps || 30,
    totalDurationInFrames,
  };
}

/**
 * Fallback: 주제 기반 기본 영상 컴포지션 생성
 * 에이전트 대화 텍스트를 영상 콘텐츠로 사용하지 않음
 */
export function createFallbackComposition(title: string): VideoCompositionProps {
  return {
    title,
    scenes: [
      {
        id: 'scene-1',
        title,
        content: '',
        durationInFrames: 90,
        transition: 'fade',
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
      },
      {
        id: 'scene-2',
        title: '소개',
        content: `${title}에 대해 알아봅니다`,
        durationInFrames: 90,
        transition: 'slide',
        backgroundColor: '#16213e',
        textColor: '#ffffff',
      },
      {
        id: 'scene-3',
        title: '핵심 내용',
        content: `${title}의 주요 포인트`,
        durationInFrames: 90,
        transition: 'zoom',
        backgroundColor: '#0f3460',
        textColor: '#ffffff',
      },
      {
        id: 'scene-4',
        title: '감사합니다',
        content: 'Video Studio로 제작되었습니다',
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
    totalDurationInFrames: 360,
  };
}

/**
 * 여러 메시지에서 VideoCompositionProps JSON을 역순으로 추출 시도
 */
export function extractCompositionFromMessages(messages: { content: string }[]): VideoCompositionProps | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const props = extractCompositionProps(messages[i].content);
    if (props) return props;
  }
  return null;
}
