'use client';

import { useState, useEffect } from 'react';
import GameCanvas from '@/components/GameCanvas';
import ChatPanel from '@/components/ChatPanel';
import CodeOutput from '@/components/CodeOutput';
import SettingsModal from '@/components/SettingsModal';
import ProgressBar from '@/components/ProgressBar';
import { useResizable } from '@/hooks/useResizable';
import { useSettings } from '@/hooks/useSettings';
import { useGameEvents } from '@/hooks/useGameEvents';
import { useDevelopmentStream } from '@/hooks/useDevelopmentStream';
import {
  LuPlay,
  LuLoader,
  LuMessageSquare,
  LuCode,
  LuSettings,
  LuChevronLeft,
  LuChevronRight,
  LuGripVertical,
} from 'react-icons/lu';

export default function Home() {
  const [task, setTask] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'code'>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // 커스텀 훅 사용
  const { apiKey, selectedModel, simulationMode, saveSettings } = useSettings();
  const { isGameReady } = useGameEvents();
  const {
    messages,
    currentPhase,
    completedPhases,
    generatedCode,
    isRunning,
    error,
    currentRound,
    maxRounds,
    startDevelopment,
    setError,
  } = useDevelopmentStream();
  const { width: sidebarWidth, isResizing, handleMouseDown } = useResizable();

  // 코드 생성 시 자동 탭 전환
  useEffect(() => {
    if (generatedCode) {
      setActiveTab('code');
    }
  }, [generatedCode]);

  const handleSaveSettings = (key: string, model: string, simMode: boolean) => {
    saveSettings(key, model, simMode);
    setError(null);
  };

  const handleStart = async () => {
    if (!task.trim() || isRunning) return;

    if (!simulationMode && !apiKey) {
      setShowSettings(true);
      setError('API 키를 먼저 설정하거나 시뮬레이션 모드를 활성화해주세요.');
      return;
    }

    setActiveTab('chat');
    await startDevelopment(task, apiKey, selectedModel, simulationMode);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#0a0a1a]">
      {/* 게임 영역 */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat ${
          isResizing ? '' : 'transition-all duration-300'
        }`}
        style={{
          backgroundImage: 'url(/assets/bg.jpeg)',
          paddingRight: isPanelCollapsed ? 0 : sidebarWidth,
        }}
      >
        <div className="game-wrapper">
          <GameCanvas />
        </div>
      </div>

      {/* 패널 접기/펼치기 버튼 */}
      <button
        onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
        className={`absolute top-1/2 -translate-y-1/2 bg-[#1a1a2e] border-2 border-r-0 border-[#4a4a6a] p-2 hover:bg-[#2a2a4a] z-20 ${
          isResizing ? '' : 'transition-all duration-300'
        }`}
        style={{ right: isPanelCollapsed ? 0 : sidebarWidth }}
      >
        {isPanelCollapsed ? (
          <LuChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <LuChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* 우측: 조작 패널 */}
      <div
        className={`absolute top-0 right-0 h-full flex flex-col bg-[#1a1a2e] border-l-4 border-[#4a4a6a] z-10 ${
          isPanelCollapsed ? 'w-0 overflow-hidden' : ''
        } ${isResizing ? '' : 'transition-all duration-300'}`}
        style={isPanelCollapsed ? undefined : { width: sidebarWidth }}
      >
        {/* 리사이즈 핸들 */}
        {!isPanelCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-20 flex items-center justify-center hover:bg-[#4a90d9]/30 ${
              isResizing ? 'bg-[#4a90d9]/50' : ''
            }`}
          >
            <LuGripVertical className="w-4 h-4 text-[#6a6a8a] opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* 패널 헤더 */}
        <div className="bg-gradient-to-r from-[#2c3e50] to-[#34495e] px-4 py-3 border-b-2 border-[#4a4a6a]">
          <h1 className="text-lg font-bold text-white">ChatDev Office</h1>
          {(isRunning || currentPhase) && (
            <div className="mt-2">
              <ProgressBar
                currentPhase={currentPhase}
                completedPhases={completedPhases}
                currentRound={currentRound}
                maxRounds={maxRounds}
              />
            </div>
          )}
        </div>

        {/* 프로젝트 입력 */}
        <div className="p-4 border-b-2 border-[#2a2a4a]">
          {error && (
            <div className="mb-3 px-3 py-2 bg-[#ff6b6b]/10 border border-[#ff6b6b] text-sm text-[#ff6b6b]">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="만들고 싶은 프로젝트를 입력하세요..."
              className="tycoon-input w-full text-sm"
              disabled={isRunning}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStart();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                disabled={!task.trim() || isRunning || !isGameReady}
                className={`tycoon-btn primary flex-1 flex items-center justify-center gap-2 ${
                  isRunning ? 'pulse-glow' : ''
                }`}
              >
                {isRunning ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    <span>개발중...</span>
                  </>
                ) : (
                  <>
                    <LuPlay className="w-4 h-4" />
                    <span>시작</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`tycoon-btn flex items-center gap-2 ${
                  !apiKey ? 'animate-pulse border-[#ff6b6b]' : ''
                }`}
              >
                <LuSettings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 탭 버튼 */}
        <div className="flex border-b-2 border-[#2a2a4a]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${
              activeTab === 'chat'
                ? 'bg-[#4a90d9] text-white'
                : 'text-[#8a8aaa] hover:bg-[#2a2a4a]'
            }`}
          >
            <LuMessageSquare className="w-4 h-4" />
            <span>대화</span>
            {messages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#2a2a4a] text-xs rounded">
                {messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${
              activeTab === 'code'
                ? 'bg-[#ffa500] text-white'
                : 'text-[#8a8aaa] hover:bg-[#2a2a4a]'
            }`}
          >
            <LuCode className="w-4 h-4" />
            <span>코드</span>
            {generatedCode && (
              <span className="ml-1 w-2 h-2 bg-[#50c878] rounded-full" />
            )}
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full bg-white/95">
              <ChatPanel messages={messages} isLoading={isRunning} />
            </div>
          ) : (
            <CodeOutput code={generatedCode} projectName={task || 'project'} />
          )}
        </div>
      </div>

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentModel={selectedModel}
        currentSimulationMode={simulationMode}
      />
    </div>
  );
}
