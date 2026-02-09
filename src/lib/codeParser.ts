/**
 * 코드 파싱 유틸리티
 */

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  extension?: string;
}

/**
 * 대화 패턴 - 코드에서 제거해야 할 내용
 */
const CONVERSATION_PATTERNS = [
  /^(?:좋습니다|알겠습니다|네|감사합니다|완료했습니다|수정했습니다|이제|다음은|아래는|다음과 같습니다)[.,!]?\s*/gim,
  /^(?:Here's|Here is|Below is|I've|Let me|Now|This is|The following)[^`\n]*\n/gim,
  /<TASK_DONE>/g,
  /^\s*(?:---+|===+)\s*$/gm,
  /^(?:코드|Code|파일|File)를?\s*(?:작성|생성|수정|완료)[^`\n]*\n/gim,
];

/**
 * 코드 블록에서 대화 내용 제거
 */
function cleanCodeContent(content: string): string {
  let cleaned = content;

  for (const pattern of CONVERSATION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 시작과 끝의 공백/줄바꿈 정리
  return cleaned.trim();
}

/**
 * 코드에서 파일 구조 파싱
 */
export function parseCodeToFiles(code: string): FileNode[] {
  const files: FileNode[] = [];

  // 1단계: 파일명이 명시된 코드 블록 추출
  // 패턴: 파일명\n```lang\n코드\n``` 또는 // 파일명\n```lang\n코드\n```
  const namedFilePattern =
    /(?:(?:\/\/|#|\/\*|<!--)\s*)?(?:파일|File|file|FILE)?\s*:?\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)\s*(?:\*\/|-->)?\s*\n```(\w+)?\n([\s\S]*?)```/g;

  const namedMatches = [...code.matchAll(namedFilePattern)];

  if (namedMatches.length > 0) {
    for (const match of namedMatches) {
      const fileName = match[1].trim();
      const content = cleanCodeContent(match[3]);

      // 빈 코드 블록 무시
      if (!content) continue;

      files.push({
        name: fileName.split('/').pop() || fileName,
        path: fileName,
        type: 'file',
        content,
        extension: fileName.split('.').pop() || 'txt',
      });
    }
  }

  // 2단계: 파일명이 없는 코드 블록도 추출 (namedMatches가 없거나 추가 코드 블록이 있는 경우)
  const allCodeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
  const allMatches = [...code.matchAll(allCodeBlockPattern)];

  // 이미 추출된 코드 블록 내용을 추적
  const extractedContents = new Set(files.map((f) => f.content));

  for (const match of allMatches) {
    const language = match[1] || 'txt';
    const content = cleanCodeContent(match[2]);

    // 빈 코드 블록 무시
    if (!content) continue;

    // 이미 추출된 내용이면 무시
    if (extractedContents.has(content)) continue;

    // 대화 내용으로 보이는 짧은 블록 무시
    if (content.length < 20 && !content.includes('\n')) continue;

    // 코드가 아닌 것 같은 내용 무시 (예: 마크다운 텍스트만 있는 경우)
    if (!looksLikeCode(content, language)) continue;

    const extension = getExtensionFromLanguage(language);
    const fileName = inferFileName(content, language, files.length);

    files.push({
      name: fileName.split('/').pop() || fileName,
      path: fileName,
      type: 'file',
      content,
      extension,
    });

    extractedContents.add(content);
  }

  // 파일이 없으면 전체 코드에서 코드 블록만 추출해서 단일 파일로
  if (files.length === 0) {
    const singleCodeMatch = code.match(/```(\w+)?\n([\s\S]*?)```/);
    if (singleCodeMatch) {
      const language = singleCodeMatch[1] || 'txt';
      const content = cleanCodeContent(singleCodeMatch[2]);
      const extension = getExtensionFromLanguage(language);

      files.push({
        name: `main.${extension}`,
        path: `main.${extension}`,
        type: 'file',
        content,
        extension,
      });
    } else {
      // 코드 블록이 없으면 전체를 코드로 처리
      const extension = detectLanguage(code);
      files.push({
        name: `main.${extension}`,
        path: `main.${extension}`,
        type: 'file',
        content: cleanCodeContent(code),
        extension,
      });
    }
  }

  return files;
}

/**
 * 내용이 코드처럼 보이는지 확인
 */
function looksLikeCode(content: string, language: string): boolean {
  // 특정 언어의 코드 패턴
  const codePatterns = [
    /^import\s+/m,
    /^export\s+/m,
    /^const\s+/m,
    /^let\s+/m,
    /^var\s+/m,
    /^function\s+/m,
    /^class\s+/m,
    /^interface\s+/m,
    /^type\s+/m,
    /^def\s+/m,
    /^from\s+\w+\s+import/m,
    /<[a-zA-Z][^>]*>/,
    /^\s*[\{\[\(]/m,
    /;\s*$/m,
    /=>\s*[\{\(]/m,
  ];

  // 언어가 명시된 경우 코드로 간주
  if (language && language !== 'txt') {
    return true;
  }

  // 코드 패턴 중 하나라도 매칭되면 코드로 간주
  return codePatterns.some((pattern) => pattern.test(content));
}

/**
 * 언어에서 확장자 추출
 */
function getExtensionFromLanguage(language: string): string {
  const langMap: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    tsx: 'tsx',
    jsx: 'jsx',
    ts: 'ts',
    js: 'js',
    python: 'py',
    py: 'py',
    html: 'html',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    yml: 'yml',
    markdown: 'md',
    md: 'md',
    sql: 'sql',
    bash: 'sh',
    shell: 'sh',
    go: 'go',
    rust: 'rs',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
  };

  return langMap[language.toLowerCase()] || language || 'txt';
}

/**
 * 파일명 추론
 */
function inferFileName(content: string, language: string, index: number): string {
  const ext = getExtensionFromLanguage(language);

  // React 컴포넌트 감지
  if (ext === 'tsx' || ext === 'jsx') {
    const componentMatch = content.match(
      /(?:export\s+default\s+function|export\s+function|function)\s+([A-Z]\w+)/
    );
    if (componentMatch) {
      return `${componentMatch[1]}.${ext}`;
    }
  }

  // HTML 감지
  if (ext === 'html' || content.includes('<!DOCTYPE') || content.includes('<html')) {
    return 'index.html';
  }

  // CSS 감지
  if (ext === 'css') {
    return index === 0 ? 'styles.css' : `styles${index}.css`;
  }

  // JSON 감지
  if (ext === 'json') {
    if (content.includes('"name"') && content.includes('"version"')) {
      return 'package.json';
    }
    if (content.includes('"compilerOptions"')) {
      return 'tsconfig.json';
    }
    return 'data.json';
  }

  // 기본 파일명
  const baseName = index === 0 ? 'main' : `file${index}`;
  return `${baseName}.${ext}`;
}

/**
 * 코드 언어 감지
 */
export function detectLanguage(code: string): string {
  if (
    code.includes('import React') ||
    code.includes('useState') ||
    code.includes('useEffect')
  ) {
    return 'tsx';
  }
  if (code.includes('def ') && code.includes(':')) {
    return 'py';
  }
  if (
    code.includes('function ') ||
    code.includes('const ') ||
    code.includes('let ')
  ) {
    return 'ts';
  }
  if (code.includes('<html') || code.includes('<!DOCTYPE')) {
    return 'html';
  }
  if (code.includes('{') && code.includes(':') && !code.includes('function')) {
    return 'json';
  }
  return 'txt';
}
