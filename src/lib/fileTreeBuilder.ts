/**
 * 파일 트리 빌더 유틸리티
 */

import { FileNode } from './codeParser';

/**
 * 파일 리스트를 트리 구조로 변환
 */
export function buildFileTree(files: FileNode[]): FileNode[] {
  const root: FileNode[] = [];
  const folderMap = new Map<string, FileNode>();

  for (const file of files) {
    const parts = file.path.split('/');
    let currentPath = '';
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        currentLevel.push({
          ...file,
          name: part,
        });
      } else {
        let folder = folderMap.get(currentPath);
        if (!folder) {
          folder = {
            name: part,
            path: currentPath,
            type: 'folder',
            children: [],
          };
          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }
        currentLevel = folder.children!;
      }
    }
  }

  return sortNodes(root);
}

/**
 * 노드 정렬: 폴더 먼저, 그 다음 파일 (알파벳 순)
 */
function sortNodes(nodes: FileNode[]): FileNode[] {
  return nodes
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((node) => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined,
    }));
}
