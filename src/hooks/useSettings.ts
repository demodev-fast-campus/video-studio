'use client';

import { useState, useEffect, useCallback } from 'react';

const API_KEY_STORAGE_KEY = 'chatdev_anthropic_api_key';
const MODEL_STORAGE_KEY = 'chatdev_selected_model';
const SIMULATION_MODE_KEY = 'chatdev_simulation_mode';
const TAVILY_API_KEY_STORAGE_KEY = 'chatdev_tavily_api_key';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export interface SettingsState {
  apiKey: string;
  selectedModel: string;
  simulationMode: boolean;
  tavilyApiKey: string;
}

export function useSettings() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [simulationMode, setSimulationMode] = useState(false);
  const [tavilyApiKey, setTavilyApiKey] = useState('');

  // 초기 로드 시 localStorage에서 설정 복원
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
    const savedSimMode = localStorage.getItem(SIMULATION_MODE_KEY) === 'true';
    const savedTavilyKey = localStorage.getItem(TAVILY_API_KEY_STORAGE_KEY) || '';
    setApiKey(savedKey);
    setSelectedModel(savedModel);
    setSimulationMode(savedSimMode);
    setTavilyApiKey(savedTavilyKey);
  }, []);

  const saveSettings = useCallback(
    (key: string, model: string, simMode: boolean, tavily?: string) => {
      setApiKey(key);
      setSelectedModel(model);
      setSimulationMode(simMode);
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      localStorage.setItem(MODEL_STORAGE_KEY, model);
      localStorage.setItem(SIMULATION_MODE_KEY, String(simMode));
      if (tavily !== undefined) {
        setTavilyApiKey(tavily);
        localStorage.setItem(TAVILY_API_KEY_STORAGE_KEY, tavily);
      }
    },
    []
  );

  return {
    apiKey,
    selectedModel,
    simulationMode,
    tavilyApiKey,
    saveSettings,
  };
}
