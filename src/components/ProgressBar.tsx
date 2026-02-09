import { Phase } from '@/types';

interface ProgressBarProps {
  currentPhase: Phase | null;
  completedPhases: Phase[];
  currentRound: number;
  maxRounds: number;
}

const PHASE_ORDER: Phase[] = ['research', 'pre-production', 'production', 'post-production', 'completed'];
const PHASE_LABELS: Record<Phase, string> = {
  'research': '리서치',
  'pre-production': '기획',
  'production': '제작',
  'post-production': '후반작업',
  'completed': '완료',
};

export default function ProgressBar({
  currentPhase,
  completedPhases,
  currentRound,
  maxRounds,
}: ProgressBarProps) {
  // Calculate overall progress percentage
  const calculateProgress = (): number => {
    if (!currentPhase) return 0;
    if (currentPhase === 'completed') return 100;

    const phaseIndex = PHASE_ORDER.indexOf(currentPhase);
    if (phaseIndex === -1) return 0;

    // Each phase contributes 25% to total progress (4 active phases)
    const baseProgress = (phaseIndex / 4) * 100;

    // Add progress within current phase based on rounds
    const phaseProgress = (currentRound / maxRounds) * 25;

    return Math.min(100, baseProgress + phaseProgress);
  };

  const progress = calculateProgress();

  return (
    <div className="w-full">
      {/* Progress percentage */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#8a8aaa]">
          {currentPhase
            ? currentPhase === 'completed'
              ? '제작 완료'
              : `${PHASE_LABELS[currentPhase]} 진행중...`
            : '대기중'}
        </span>
        <span className="text-xs font-mono text-white">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="progress-container h-4">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase indicators */}
      <div className="flex justify-between mt-2">
        {PHASE_ORDER.slice(0, 4).map((phase) => {
          const isCompleted = completedPhases.includes(phase);
          const isCurrent = currentPhase === phase;

          return (
            <div
              key={phase}
              className={`flex items-center gap-1 text-xs ${
                isCompleted
                  ? 'text-[#50c878]'
                  : isCurrent
                  ? 'text-[#4a90d9]'
                  : 'text-[#6a6a8a]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompleted
                    ? 'bg-[#50c878]'
                    : isCurrent
                    ? 'bg-[#4a90d9] animate-pulse'
                    : 'bg-[#4a4a6a]'
                }`}
              />
              <span>{PHASE_LABELS[phase]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
