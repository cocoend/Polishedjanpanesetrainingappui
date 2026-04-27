import type {
  AttemptDto,
  CreateAttemptDto,
  CreateSessionResponseDto,
  ExplanationModelDetailDto,
  FeedbackDto,
  HomeResponseDto,
  LearnedCardDto,
  LearnedCardListResponseDto,
  LatestUnfinishedSessionDto,
  PracticeSessionDetailDto,
  SessionAttemptsResponseDto,
  ThemeDetailResponseDto,
  ThemeListItemDto,
} from '@polished/shared';
import type { RetryContextDto } from '@polished/shared';

import { getAnonymousUserId } from './anonymous-user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ANONYMOUS_USER_HEADER = 'x-anonymous-user-id';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      [ANONYMOUS_USER_HEADER]: getAnonymousUserId(),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getThemes() {
  return request<ThemeListItemDto[]>('/api/themes');
}

export function getHome() {
  return request<HomeResponseDto>('/api/home');
}

export function getThemeDetail(themeId: string) {
  return request<ThemeDetailResponseDto>(`/api/themes/${themeId}/detail`);
}

export function getExplanationModels() {
  return request<ExplanationModelDetailDto[]>('/api/explanation-models');
}

export function createSession(input: {
  themeId: string;
  selectedModelId: string;
}) {
  return request<CreateSessionResponseDto>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getSession(sessionId: string) {
  return request<PracticeSessionDetailDto>(`/api/sessions/${sessionId}`);
}

export function getLatestUnfinishedSession() {
  return request<LatestUnfinishedSessionDto>('/api/sessions/latest-unfinished');
}

export function createAttempt(sessionId: string, input: CreateAttemptDto) {
  return request<AttemptDto>(`/api/sessions/${sessionId}/attempts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createAttemptUpload(
  sessionId: string,
  input: {
    audio: File | Blob;
    audioDurationSec?: number;
    transcriptText?: string;
  },
) {
  const formData = new FormData();
  formData.append('audio', input.audio);

  if (input.audioDurationSec !== undefined) {
    formData.append('audioDurationSec', String(input.audioDurationSec));
  }

  if (input.transcriptText?.trim()) {
    formData.append('transcriptText', input.transcriptText);
  }

  return request<AttemptDto>(`/api/sessions/${sessionId}/attempts`, {
    method: 'POST',
    body: formData,
  });
}

export function getSessionAttempts(sessionId: string) {
  return request<SessionAttemptsResponseDto>(`/api/sessions/${sessionId}/attempts`);
}

export function getAttempt(attemptId: string) {
  return request<AttemptDto>(`/api/attempts/${attemptId}`);
}

export function createFeedback(attemptId: string) {
  return request<FeedbackDto>(`/api/attempts/${attemptId}/feedback`, {
    method: 'POST',
  });
}

export function getFeedback(feedbackId: string) {
  return request<FeedbackDto>(`/api/feedback/${feedbackId}`);
}

export function getRetryContext(sessionId: string) {
  return request<RetryContextDto>(`/api/sessions/${sessionId}/retry-context`);
}

export function saveLearnedCard(sessionId: string) {
  return request<LearnedCardDto>(`/api/sessions/${sessionId}/learned-card`, {
    method: 'POST',
  });
}

export function getLearnedCards() {
  return request<LearnedCardListResponseDto>('/api/learned-cards');
}

export function getLearnedCard(cardId: string) {
  return request<LearnedCardDto>(`/api/learned-cards/${cardId}`);
}

export function markLearnedCardAsRead(cardId: string) {
  return request<LearnedCardDto>(`/api/learned-cards/${cardId}/read`, {
    method: 'PATCH',
  });
}

export function deleteLearnedCard(cardId: string) {
  return request<{ success: boolean }>(`/api/learned-cards/${cardId}`, {
    method: 'DELETE',
  });
}
