/**
 * Enhanced code extraction utilities for better multi-file code handling
 */

interface ExtractedFile {
  filename: string;
  language: string;
  content: string;
}

// Language to file extension mapping
const LANGUAGE_EXTENSIONS: Record<string, string> = {
  tsx: '.tsx',
  ts: '.ts',
  typescript: '.ts',
  jsx: '.jsx',
  js: '.js',
  javascript: '.js',
  html: '.html',
  css: '.css',
  json: '.json',
  python: '.py',
  py: '.py',
  rust: '.rs',
  go: '.go',
  java: '.java',
  cpp: '.cpp',
  c: '.c',
  sql: '.sql',
  yaml: '.yaml',
  yml: '.yaml',
  markdown: '.md',
  md: '.md',
  shell: '.sh',
  bash: '.sh',
};

/**
 * Extract filename from code content or comments
 */
function extractFilename(content: string): string | null {
  // Pattern 1: // filename: App.tsx
  const filenameComment = content.match(/^\/\/\s*filename:\s*(.+?)(?:\n|$)/im);
  if (filenameComment) {
    return filenameComment[1].trim();
  }

  // Pattern 2: # filename: app.py
  const hashComment = content.match(/^#\s*filename:\s*(.+?)(?:\n|$)/im);
  if (hashComment) {
    return hashComment[1].trim();
  }

  // Pattern 3: /* filename: style.css */
  const blockComment = content.match(/^\/\*\s*filename:\s*(.+?)\s*\*\//im);
  if (blockComment) {
    return blockComment[1].trim();
  }

  // Pattern 4: <!-- filename: index.html -->
  const htmlComment = content.match(/^<!--\s*filename:\s*(.+?)\s*-->/im);
  if (htmlComment) {
    return htmlComment[1].trim();
  }

  return null;
}

/**
 * Infer filename from content and language
 */
function inferFilename(content: string, language: string, index: number): string {
  const ext = LANGUAGE_EXTENSIONS[language.toLowerCase()] || `.${language}`;

  // Check for common patterns
  if (language === 'html' || content.includes('<!DOCTYPE')) {
    return 'index.html';
  }

  if (language === 'tsx' || language === 'jsx') {
    // Check if it's a React component
    const componentMatch = content.match(
      /(?:export\s+default\s+function|function)\s+(\w+)/
    );
    if (componentMatch) {
      return `${componentMatch[1]}${ext}`;
    }
    return index === 0 ? `App${ext}` : `Component${index}${ext}`;
  }

  if (language === 'css') {
    return index === 0 ? 'styles.css' : `styles${index}.css`;
  }

  if (language === 'json') {
    if (content.includes('"dependencies"') || content.includes('"name"')) {
      return 'package.json';
    }
    return 'data.json';
  }

  return index === 0 ? `main${ext}` : `file${index}${ext}`;
}

/**
 * Extract all code blocks from content
 */
export function extractCodeBlocks(content: string): ExtractedFile[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const results: ExtractedFile[] = [];
  let match;
  let index = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'txt';
    const codeContent = match[2].trim();

    // Skip empty code blocks
    if (!codeContent) continue;

    // Try to extract or infer filename
    let filename = extractFilename(codeContent);
    if (!filename) {
      filename = inferFilename(codeContent, language, index);
    }

    // Clean the content (remove filename comment if present)
    const cleanedContent = codeContent
      .replace(/^\/\/\s*filename:\s*.+?\n/im, '')
      .replace(/^#\s*filename:\s*.+?\n/im, '')
      .replace(/^\/\*\s*filename:\s*.+?\s*\*\/\n?/im, '')
      .replace(/^<!--\s*filename:\s*.+?\s*-->\n?/im, '')
      .trim();

    results.push({
      filename,
      language,
      content: cleanedContent,
    });

    index++;
  }

  return results;
}

/**
 * Extract code for display/download
 * Prioritizes the main file (App.tsx, index.html, main.*)
 */
export function extractMainCode(content: string): string {
  const files = extractCodeBlocks(content);

  if (files.length === 0) {
    return content;
  }

  if (files.length === 1) {
    return files[0].content;
  }

  // If multiple files, combine them with file headers
  return files
    .map((file) => {
      return `// ===== ${file.filename} =====\n\n${file.content}`;
    })
    .join('\n\n');
}

/**
 * Get the primary/main file from extracted code
 */
export function getPrimaryFile(files: ExtractedFile[]): ExtractedFile | null {
  if (files.length === 0) return null;
  if (files.length === 1) return files[0];

  // Priority order for main files
  const priorityNames = [
    'index.html',
    'App.tsx',
    'App.jsx',
    'index.tsx',
    'index.jsx',
    'main.ts',
    'main.tsx',
    'main.js',
  ];

  for (const name of priorityNames) {
    const file = files.find((f) => f.filename.toLowerCase() === name.toLowerCase());
    if (file) return file;
  }

  return files[0];
}
