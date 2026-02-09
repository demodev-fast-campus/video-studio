import { DirectorAgent } from './Director';
import { ProducerAgent } from './Producer';
import { ScriptwriterAgent } from './Scriptwriter';
import { MotionDesignerAgent } from './MotionDesigner';
import { QAReviewerAgent } from './QAReviewer';
import { ResearcherAgent } from './Researcher';
import { AgentRole } from '@/types';
import { AgentSystemPrompt } from '../types';

export const AGENT_PROMPTS: Record<AgentRole, AgentSystemPrompt> = {
  Researcher: ResearcherAgent,
  Director: DirectorAgent,
  Producer: ProducerAgent,
  Scriptwriter: ScriptwriterAgent,
  MotionDesigner: MotionDesignerAgent,
  QAReviewer: QAReviewerAgent,
};

export { DirectorAgent, ProducerAgent, ScriptwriterAgent, MotionDesignerAgent, QAReviewerAgent, ResearcherAgent };
