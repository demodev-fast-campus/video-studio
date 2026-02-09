'use client';

import { useState, useMemo, useCallback } from 'react';
import { LuCopy, LuCheck, LuFile, LuDownload } from 'react-icons/lu';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { parseCodeToFiles, FileNode } from '@/lib/codeParser';
import { buildFileTree } from '@/lib/fileTreeBuilder';
import { FileTreeItem, FILE_COLORS } from './FileTree';

interface CodeOutputProps {
  code: string;
  projectName?: string;
}

export default function CodeOutput({ code, projectName = 'project' }: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const files = useMemo(() => parseCodeToFiles(code), [code]);
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const selectedFile = useMemo(() => {
    if (selectedFilePath) {
      return files.find((f) => f.path === selectedFilePath) || files[0] || null;
    }
    return files[0] || null;
  }, [files, selectedFilePath]);

  const setSelectedFile = useCallback((file: FileNode | null) => {
    setSelectedFilePath(file?.path || null);
  }, []);

  const handleCopy = async () => {
    const content = selectedFile?.content || code;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleDownload = async () => {
    const zip = new JSZip();
    const projectFolder = zip.folder(projectName);

    for (const file of files) {
      if (file.content) {
        projectFolder?.file(file.path, file.content);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${projectName}.zip`);
  };

  const currentContent = selectedFile?.content || code;

  if (!code) {
    return (
      <div className="pixel-panel h-full flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-[#5a5a7a] text-center">
          <div className="text-6xl mb-4">
            <LuFile className="w-16 h-16 mx-auto text-[#3a3a5a]" />
          </div>
          <p className="text-lg">생성된 코드가</p>
          <p className="text-lg">여기에 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a]">
      {/* 툴바 */}
      <div className="flex items-center justify-between p-2 border-b-2 border-[#2a2a4a] bg-[#1a1a2e]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6a6a8a]">{files.length} 파일</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs border border-[#4a4a6a] hover:border-[#6a6a8a] bg-[#2a2a4a] text-[#e0e0e0] transition-colors"
          >
            {copied ? (
              <>
                <LuCheck className="w-3 h-3 text-[#50c878]" />
                <span className="text-[#50c878]">복사됨</span>
              </>
            ) : (
              <>
                <LuCopy className="w-3 h-3" />
                <span>복사</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs border border-[#4a90d9] hover:bg-[#4a90d9] bg-[#2a2a4a] text-[#4a90d9] hover:text-white transition-colors"
          >
            <LuDownload className="w-3 h-3" />
            <span>다운로드</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 파일 트리 */}
        <div className="w-40 border-r border-[#2a2a4a] overflow-auto bg-[#12121a]">
          <div className="py-2">
            <div className="px-2 py-1 text-xs text-[#6a6a8a] uppercase tracking-wider font-bold">
              파일 탐색기
            </div>
            {fileTree.map((node) => (
              <FileTreeItem
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedFile?.path || ''}
                onSelect={setSelectedFile}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
              />
            ))}
          </div>
        </div>

        {/* 코드 뷰어 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 파일 탭 */}
          {selectedFile && (
            <div className="flex items-center gap-1 px-2 py-1 border-b border-[#2a2a4a] bg-[#1a1a2e]">
              <LuFile
                className="w-3 h-3"
                style={{
                  color:
                    FILE_COLORS[selectedFile.extension || 'default'] ||
                    FILE_COLORS.default,
                }}
              />
              <span className="text-xs text-white">{selectedFile.name}</span>
            </div>
          )}

          {/* 코드 영역 */}
          <div className="flex-1 overflow-auto p-3">
            <pre className="text-xs text-[#50c878] font-mono">
              {currentContent.split('\n').map((line, index) => (
                <div key={index} className="flex hover:bg-[#1a1a2e]">
                  <span className="text-[#4a4a6a] w-8 text-right mr-3 select-none">
                    {index + 1}
                  </span>
                  <code className="flex-1 whitespace-pre">{line}</code>
                </div>
              ))}
            </pre>
          </div>

          {/* 상태 바 */}
          <div className="flex items-center justify-between px-2 py-1 border-t border-[#2a2a4a] text-[#5a5a7a] text-xs bg-[#12121a]">
            <span>{selectedFile?.extension?.toUpperCase() || 'TEXT'}</span>
            <span>
              {currentContent.split('\n').length} 줄 •{' '}
              {(new TextEncoder().encode(currentContent).length / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
