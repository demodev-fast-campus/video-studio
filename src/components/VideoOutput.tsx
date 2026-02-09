'use client';

import { useState, useMemo, useCallback } from 'react';
import { LuPlay, LuDownload, LuCode, LuEye, LuLoader, LuFilm } from 'react-icons/lu';
import { Player } from '@remotion/player';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import { VideoComposition } from '@/remotion/VideoComposition';
import { VideoCompositionProps } from '@/types/remotion';

interface VideoOutputProps {
  compositionData: {
    props: VideoCompositionProps | null;
    code: string;
  };
}

export default function VideoOutput({ compositionData }: VideoOutputProps) {
  const [showCode, setShowCode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { props, code } = compositionData;

  const handleDownload = useCallback(async () => {
    if (!props) return;
    setIsDownloading(true);
    setDownloadError(null);
    setRenderProgress(0);

    try {
      const { getBlob } = await renderMediaOnWeb({
        composition: {
          component: VideoComposition as unknown as React.ComponentType<Record<string, unknown>>,
          durationInFrames: props.totalDurationInFrames,
          fps: props.fps,
          width: 1920,
          height: 1080,
          id: 'VideoComposition',
          calculateMetadata: null,
        },
        inputProps: props,
        container: 'webm',
        videoCodec: 'vp8',
        onProgress: ({ renderedFrames }) => {
          setRenderProgress(
            Math.round((renderedFrames / props.totalDurationInFrames) * 100)
          );
        },
      });

      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video-studio-output.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
      setRenderProgress(0);
    }
  }, [props]);

  const sceneCount = useMemo(() => props?.scenes.length ?? 0, [props]);
  const duration = useMemo(() => {
    if (!props) return '0s';
    return `${(props.totalDurationInFrames / props.fps).toFixed(1)}s`;
  }, [props]);

  if (!props) {
    return (
      <div className="pixel-panel h-full flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-[#5a5a7a] text-center">
          <div className="text-6xl mb-4">
            <LuFilm className="w-16 h-16 mx-auto text-[#3a3a5a]" />
          </div>
          <p className="text-lg">생성된 영상이</p>
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
          <span className="text-xs text-[#6a6a8a]">
            {sceneCount}개 장면 • {duration}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 px-2 py-1 text-xs border border-[#4a4a6a] hover:border-[#6a6a8a] bg-[#2a2a4a] text-[#e0e0e0] transition-colors"
          >
            {showCode ? (
              <>
                <LuEye className="w-3 h-3" />
                <span>미리보기</span>
              </>
            ) : (
              <>
                <LuCode className="w-3 h-3" />
                <span>코드 보기</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1 px-2 py-1 text-xs border border-[#4a90d9] hover:bg-[#4a90d9] bg-[#2a2a4a] text-[#4a90d9] hover:text-white transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <LuLoader className="w-3 h-3 animate-spin" />
                <span>렌더링 {renderProgress}%</span>
              </>
            ) : (
              <>
                <LuDownload className="w-3 h-3" />
                <span>WebM 다운로드</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="px-3 py-2 bg-[#ff6b6b]/10 border-b border-[#ff6b6b] text-xs text-[#ff6b6b]">
          {downloadError}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        {showCode ? (
          <div className="p-3">
            <pre className="text-xs text-[#50c878] font-mono">
              {code.split('\n').map((line, index) => (
                <div key={index} className="flex hover:bg-[#1a1a2e]">
                  <span className="text-[#4a4a6a] w-8 text-right mr-3 select-none">
                    {index + 1}
                  </span>
                  <code className="flex-1 whitespace-pre">{line}</code>
                </div>
              ))}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="w-full max-w-[480px]">
              <Player
                component={VideoComposition as unknown as React.ComponentType<Record<string, unknown>>}
                inputProps={props as unknown as Record<string, unknown>}
                durationInFrames={props.totalDurationInFrames}
                fps={props.fps}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: 4,
                  border: '2px solid #2a2a4a',
                }}
                controls
                autoPlay
                loop
              />
            </div>
          </div>
        )}
      </div>

      {/* 상태 바 */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-[#2a2a4a] text-[#5a5a7a] text-xs bg-[#12121a]">
        <span className="flex items-center gap-1">
          <LuPlay className="w-3 h-3" />
          {props.fps}fps
        </span>
        <span>
          {props.totalDurationInFrames} 프레임 • {sceneCount} 장면
        </span>
      </div>
    </div>
  );
}
