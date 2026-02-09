import { CEOAgent } from './CEO';
import { CTOAgent } from './CTO';
import { ProgrammerAgent } from './Programmer';
import { ReviewerAgent } from './Reviewer';
import { TesterAgent } from './Tester';
import { AgentRole } from '@/types';
import { AgentSystemPrompt } from '../types';

export const AGENT_PROMPTS: Record<AgentRole, AgentSystemPrompt> = {
  CEO: CEOAgent,
  CTO: CTOAgent,
  Programmer: ProgrammerAgent,
  Reviewer: ReviewerAgent,
  Tester: TesterAgent,
};

export { CEOAgent, CTOAgent, ProgrammerAgent, ReviewerAgent, TesterAgent };
