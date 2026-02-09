'use client';

import {
  LuFile,
  LuFolder,
  LuFolderOpen,
  LuChevronRight,
  LuChevronDown,
} from 'react-icons/lu';
import { FileNode } from '@/lib/codeParser';

// 파일 확장자에 따른 색상
export const FILE_COLORS: Record<string, string> = {
  ts: '#3178c6',
  tsx: '#3178c6',
  js: '#f7df1e',
  jsx: '#f7df1e',
  py: '#3776ab',
  css: '#1572b6',
  html: '#e34f26',
  json: '#ffa500',
  md: '#083fa1',
  txt: '#8a8aaa',
  default: '#50c878',
};

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  selectedPath: string;
  onSelect: (node: FileNode) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
}

export function FileTreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  expandedFolders,
  onToggleFolder,
}: FileTreeItemProps) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedPath === node.path;
  const fileColor = isFolder
    ? '#ffa500'
    : FILE_COLORS[node.extension || 'default'] || FILE_COLORS.default;

  const handleClick = () => {
    if (isFolder) {
      onToggleFolder(node.path);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[#2a2a4a] transition-colors ${
          isSelected ? 'bg-[#3a3a5a]' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <LuChevronDown className="w-3 h-3 text-[#6a6a8a]" />
            ) : (
              <LuChevronRight className="w-3 h-3 text-[#6a6a8a]" />
            )}
            {isExpanded ? (
              <LuFolderOpen className="w-4 h-4" style={{ color: fileColor }} />
            ) : (
              <LuFolder className="w-4 h-4" style={{ color: fileColor }} />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <LuFile className="w-4 h-4" style={{ color: fileColor }} />
          </>
        )}
        <span className="text-xs text-white truncate">{node.name}</span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
