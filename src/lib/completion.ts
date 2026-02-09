/**
 * 공통 완료 체크 유틸리티
 */

export const TASK_DONE_MARKER = '<TASK_DONE>';
export const MAX_SAME_RESPONSE_COUNT = 2;

export interface CompletionState {
  round: number;
  maxRounds: number;
  lastResponse: string;
  sameResponseCount: number;
}

/**
 * 응답이 완료 조건을 만족하는지 체크
 */
export function checkCompletion(
  response: string,
  state: CompletionState
): { isComplete: boolean; updatedState: CompletionState } {
  const updatedState = { ...state };

  // TASK_DONE 마커 체크
  if (response.includes(TASK_DONE_MARKER)) {
    return { isComplete: true, updatedState };
  }

  // 최대 라운드 체크
  if (state.round >= state.maxRounds) {
    return { isComplete: true, updatedState };
  }

  // 동일 응답 반복 체크
  if (response === state.lastResponse) {
    updatedState.sameResponseCount = state.sameResponseCount + 1;
    if (updatedState.sameResponseCount >= MAX_SAME_RESPONSE_COUNT) {
      return { isComplete: true, updatedState };
    }
  } else {
    updatedState.sameResponseCount = 0;
  }

  updatedState.lastResponse = response;
  return { isComplete: false, updatedState };
}
