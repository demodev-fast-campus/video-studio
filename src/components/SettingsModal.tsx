'use client';

import { useState, useEffect } from 'react';
import { LuX, LuKey, LuCheck, LuTriangleAlert, LuLoader, LuCpu } from 'react-icons/lu';

interface ModelInfo {
  id: string;
  displayName: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string, simulationMode: boolean, tavilyApiKey: string) => void;
  currentApiKey: string;
  currentModel: string;
  currentSimulationMode: boolean;
  currentTavilyApiKey: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  currentApiKey,
  currentModel,
  currentSimulationMode,
  currentTavilyApiKey,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [model, setModel] = useState(currentModel);
  const [simulationMode, setSimulationMode] = useState(currentSimulationMode);
  const [tavilyApiKey, setTavilyApiKey] = useState(currentTavilyApiKey);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(currentApiKey);
    setModel(currentModel);
    setSimulationMode(currentSimulationMode);
    setTavilyApiKey(currentTavilyApiKey);
  }, [currentApiKey, currentModel, currentSimulationMode, currentTavilyApiKey, isOpen]);

  // API 키가 유효하면 모델 목록 가져오기
  useEffect(() => {
    if (!isOpen || !apiKey || apiKey.length < 10) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('/api/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        });

        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    const debounceTimer = setTimeout(fetchModels, 500);
    return () => clearTimeout(debounceTimer);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey, model, simulationMode, tavilyApiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const maskedKey = apiKey
    ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#1a1a2e] border-4 border-[#4a4a6a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-[#3a3a5a] bg-gradient-to-r from-[#4a90d9] to-[#6ab0f9]">
          <div className="flex items-center gap-2">
            <LuKey className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">설정</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#8a8aaa] mb-2">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-4 py-3 bg-[#0a0a1a] border-2 border-[#4a4a6a] text-white font-mono text-sm focus:border-[#4a90d9] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a8a] hover:text-white text-xs"
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {apiKey && (
              <p className="mt-2 text-xs text-[#6a6a8a]">
                저장된 키: {maskedKey}
              </p>
            )}
          </div>

          {/* Tavily API Key */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#8a8aaa] mb-2">
              Tavily API Key (선택사항)
            </label>
            <input
              type="password"
              value={tavilyApiKey}
              onChange={(e) => setTavilyApiKey(e.target.value)}
              placeholder="tvly-..."
              className="w-full px-4 py-3 bg-[#0a0a1a] border-2 border-[#4a4a6a] text-white font-mono text-sm focus:border-[#4a90d9] focus:outline-none transition-colors"
            />
            <p className="mt-2 text-xs text-[#6a6a8a]">
              웹 검색(리서치)에 사용됩니다. 없으면 DuckDuckGo를 사용합니다.
            </p>
          </div>

          {/* 모델 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#8a8aaa] mb-2">
              <div className="flex items-center gap-2">
                <LuCpu className="w-4 h-4" />
                모델 선택
              </div>
            </label>
            <div className="relative">
              {isLoadingModels ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a1a] border-2 border-[#4a4a6a] text-[#6a6a8a]">
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>모델 목록 로딩중...</span>
                </div>
              ) : models.length > 0 ? (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a1a] border-2 border-[#4a4a6a] text-white text-sm focus:border-[#4a90d9] focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-3 bg-[#0a0a1a] border-2 border-[#4a4a6a] text-[#6a6a8a] text-sm">
                  {apiKey ? 'API 키를 확인해주세요' : 'API 키를 먼저 입력해주세요'}
                </div>
              )}
            </div>
            {model && (
              <p className="mt-2 text-xs text-[#6a6a8a]">
                선택된 모델: {model}
              </p>
            )}
          </div>

          {/* 시뮬레이션 모드 */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  simulationMode ? 'bg-[#50c878]' : 'bg-[#4a4a6a]'
                }`}
                onClick={() => setSimulationMode(!simulationMode)}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    simulationMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm font-bold text-[#8a8aaa]">
                시뮬레이션 모드 (데모)
              </span>
            </label>
            <p className="mt-2 text-xs text-[#6a6a8a] ml-15">
              {simulationMode
                ? 'API 호출 없이 미리 정의된 대화로 데모를 실행합니다.'
                : 'API 키가 없어도 동작을 미리 확인할 수 있습니다.'}
            </p>
          </div>

          <div className="p-3 bg-[#2a2a4a] border-2 border-[#3a3a5a] mb-6">
            <div className="flex items-start gap-2">
              <LuTriangleAlert className="w-4 h-4 text-[#ffa500] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#8a8aaa]">
                <p className="mb-1">
                  API 키는 브라우저 로컬 스토리지에 암호화되어 저장됩니다.
                </p>
                <p>
                  키를 얻으려면{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4a90d9] hover:underline"
                  >
                    Anthropic Console
                  </a>
                  을 방문하세요.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#3a3a5a] border-2 border-[#4a4a6a] text-white font-bold hover:bg-[#4a4a6a] transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!simulationMode && !apiKey.trim()}
              className={`flex-1 px-4 py-2 border-2 font-bold transition-colors flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-[#50c878] border-[#40b868] text-white'
                  : simulationMode || apiKey.trim()
                  ? 'bg-[#4a90d9] border-[#3a80c9] text-white hover:bg-[#5aa0e9]'
                  : 'bg-[#2a2a4a] border-[#3a3a5a] text-[#6a6a8a] cursor-not-allowed'
              }`}
            >
              {saved ? (
                <>
                  <LuCheck className="w-4 h-4" />
                  저장됨
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
