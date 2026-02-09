import { VideoCompositionProps, VideoScene } from '@/types/remotion';

/**
 * 에이전트 응답에서 VideoCompositionProps JSON을 추출합니다.
 */
export function extractCompositionProps(content: string): VideoCompositionProps | null {
  // ```json 블록에서 JSON 추출 (여러 개일 수 있음)
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = jsonBlockRegex.exec(content)) !== null) {
    const result = tryParseComposition(match[1].trim());
    if (result) return result;
  }

  // ``` 블록 없이 JSON 직접 파싱 시도
  const jsonMatch = content.match(/\{[\s\S]*"scenes"[\s\S]*\}/);
  if (jsonMatch) {
    const result = tryParseComposition(jsonMatch[0]);
    if (result) return result;
  }

  return null;
}

/**
 * JSON 문자열을 파싱하고 VideoCompositionProps로 변환 시도
 */
function tryParseComposition(jsonStr: string): VideoCompositionProps | null {
  // 불완전한 JSON 복구 시도: 끝이 잘린 경우 brackets 맞추기
  const repaired = repairJson(jsonStr);

  try {
    const parsed = JSON.parse(repaired);
    if (isCompositionLike(parsed)) {
      return normalizeProps(parsed);
    }
  } catch {
    // 파싱 실패
  }

  return null;
}

/**
 * 잘린 JSON 복구 시도
 */
function repairJson(json: string): string {
  let str = json.trim();

  // 트레일링 콤마 제거
  str = str.replace(/,\s*([}\]])/g, '$1');

  // 열린 brackets/braces 카운트
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;

  for (const ch of str) {
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }

  // 닫히지 않은 brackets/braces 추가
  while (brackets > 0) { str += ']'; brackets--; }
  while (braces > 0) { str += '}'; braces--; }

  return str;
}

/**
 * 다양한 형식의 에이전트 JSON 인식
 * - title 또는 projectName
 * - scenes 배열 존재
 * - colorScheme 존재
 */
function isCompositionLike(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  // title 또는 projectName 필요
  if (typeof obj.title !== 'string' && typeof obj.projectName !== 'string') return false;

  // scenes 배열 필요
  if (!Array.isArray(obj.scenes) || obj.scenes.length === 0) return false;

  // colorScheme 필요
  if (!obj.colorScheme || typeof obj.colorScheme !== 'object') return false;

  // 최소 1개 장면에 title과 content가 있어야 함
  const scenes = obj.scenes as Record<string, unknown>[];
  const hasValidScene = scenes.some(
    (s) => s && typeof s === 'object' && typeof s.title === 'string'
  );

  return hasValidScene;
}

/**
 * Props 정규화 - 다양한 에이전트 출력 형식을 VideoCompositionProps로 변환
 */
function normalizeProps(raw: Record<string, unknown>): VideoCompositionProps {
  const title = (raw.title || raw.projectName || 'Untitled') as string;

  // colorScheme 정규화
  const rawCS = raw.colorScheme as Record<string, string>;
  const colorScheme = {
    primary: rawCS.primary || '#4a90d9',
    secondary: rawCS.secondary || rawCS.accent || '#50c878',
    background: rawCS.background || '#0a0a1a',
    text: rawCS.text || '#ffffff',
  };

  // fps
  const fps = (typeof raw.fps === 'number' ? raw.fps : 30);

  // scenes 정규화
  const rawScenes = raw.scenes as Record<string, unknown>[];
  const scenes: VideoScene[] = rawScenes
    .filter((s) => s && typeof s === 'object' && typeof s.title === 'string')
    .map((s, index) => {
      // content: 직접 content 필드 또는 elements 내 text content 조합
      let content = '';
      if (typeof s.content === 'string' && s.content.length > 0) {
        content = s.content;
      } else if (Array.isArray(s.elements)) {
        // elements에서 text 타입의 content를 추출
        const textContents = (s.elements as Record<string, unknown>[])
          .filter((el) => el.type === 'text' && typeof el.content === 'string')
          .map((el) => el.content as string);
        content = textContents.join('\n');
      }

      // durationInFrames
      let duration = 90;
      if (typeof s.durationInFrames === 'number' && s.durationInFrames > 0) {
        duration = s.durationInFrames;
      } else if (typeof s.endFrame === 'number' && typeof s.startFrame === 'number') {
        duration = (s.endFrame as number) - (s.startFrame as number);
      }

      // transition
      const validTransitions = ['fade', 'slide', 'zoom', 'none'] as const;
      const transition = validTransitions.includes(s.transition as typeof validTransitions[number])
        ? (s.transition as VideoScene['transition'])
        : 'fade';

      return {
        id: (s.id || `scene-${index + 1}`) as string,
        title: s.title as string,
        content,
        durationInFrames: duration,
        transition,
        backgroundColor: (typeof s.backgroundColor === 'string' ? s.backgroundColor : colorScheme.background),
        textColor: (typeof s.textColor === 'string' ? s.textColor : colorScheme.text),
      };
    });

  if (scenes.length === 0) {
    return createFallbackComposition(title);
  }

  const totalDurationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  return { title, scenes, colorScheme, fps, totalDurationInFrames };
}

/**
 * Fallback: 주제 기반 기본 영상 컴포지션 생성
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
