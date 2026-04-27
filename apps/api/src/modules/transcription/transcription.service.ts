import { access, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';

type TranscriptionModelId = 'prep' | 'stepbystep' | 'scqa' | string;
type TranscriptionProviderId = 'template' | 'openai';

export interface TranscriptionRequest {
  themeTitle: string;
  selectedModelId: TranscriptionModelId;
  audioStorageKey?: string | null;
  audioMimeType: string;
  audioDurationSec: number;
  audioFileSizeBytes: number;
}

export interface TranscriptionResult {
  transcriptText: string;
  transcriptionProvider: string;
  transcriptionModel: string;
}

const DEFAULT_TRANSCRIPTION_PROVIDER: TranscriptionProviderId = 'template';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  async transcribeUploadedAttempt(input: TranscriptionRequest): Promise<TranscriptionResult> {
    const provider = this.resolveProvider();

    if (provider === 'template') {
      return this.transcribeWithTemplateProvider(input);
    }

    return this.transcribeWithOpenAiFallback(input);
  }

  private resolveProvider(): TranscriptionProviderId {
    const configuredProvider = process.env.TRANSCRIPTION_PROVIDER?.trim().toLowerCase();

    if (configuredProvider === 'openai') {
      return 'openai';
    }

    if (configuredProvider === 'template' || !configuredProvider) {
      return DEFAULT_TRANSCRIPTION_PROVIDER;
    }

    return DEFAULT_TRANSCRIPTION_PROVIDER;
  }

  private transcribeWithTemplateProvider(
    input: TranscriptionRequest,
  ): Promise<TranscriptionResult> {
    const transcriptText = this.buildTranscriptTemplate(
      input.themeTitle,
      input.selectedModelId,
      input.audioDurationSec,
    );

    return Promise.resolve({
      transcriptText,
      transcriptionProvider: 'template',
      transcriptionModel: 'template-ja-v2',
    });
  }

  private transcribeWithOpenAiFallback(
    input: TranscriptionRequest,
  ): Promise<TranscriptionResult> {
    return this.transcribeWithOpenAiProvider(input).catch((error: unknown) => {
      this.logger.warn(
        `OpenAI transcription fallback activated: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      const transcriptText = this.buildTranscriptTemplate(
        input.themeTitle,
        input.selectedModelId,
        input.audioDurationSec,
      );

      return {
        transcriptText,
        transcriptionProvider: 'openai-fallback-template',
        transcriptionModel:
          process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || 'gpt-4o-mini-transcribe',
      };
    });
  }

  private async transcribeWithOpenAiProvider(
    input: TranscriptionRequest,
  ): Promise<TranscriptionResult> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }

    if (!input.audioStorageKey) {
      throw new Error('audioStorageKey is required for OpenAI transcription.');
    }

    const absoluteFilePath = await this.resolveStoredAudioPath(input.audioStorageKey);
    const fileBuffer = await readFile(absoluteFilePath);
    const model = process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || 'gpt-4o-mini-transcribe';
    const formData = new FormData();
    const blob = new Blob([fileBuffer], {
      type: input.audioMimeType || 'audio/webm',
    });

    formData.append('file', blob, basename(absoluteFilePath));
    formData.append('model', model);
    formData.append('language', 'ja');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI transcription request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as { text?: unknown };
    const transcriptText = typeof payload.text === 'string' ? payload.text.trim() : '';

    if (!transcriptText) {
      throw new Error('OpenAI transcription returned an empty transcript.');
    }

    return {
      transcriptText,
      transcriptionProvider: 'openai',
      transcriptionModel: model,
    };
  }

  private async resolveStoredAudioPath(audioStorageKey: string) {
    const candidates = [
      join(process.cwd(), 'uploads', audioStorageKey),
      join(process.cwd(), 'apps', 'api', 'uploads', audioStorageKey),
      join(process.cwd(), 'dist', 'apps', 'api', 'uploads', audioStorageKey),
    ];

    for (const candidate of candidates) {
      try {
        await access(candidate);
        return candidate;
      } catch {
        // Try the next candidate path.
      }
    }

    throw new Error(`Uploaded audio file not found for key "${audioStorageKey}".`);
  }

  private buildTranscriptTemplate(
    themeTitle: string,
    selectedModelId: TranscriptionModelId,
    audioDurationSec: number,
  ) {
    const baseSubject = themeTitle.replace('を説明する', '').trim() || 'このテーマ';
    const emphasis =
      audioDurationSec >= 90
        ? 'できるだけ丁寧に順番を分けて説明します。'
        : '簡潔にポイントを整理して説明します。';

    if (selectedModelId === 'prep') {
      return [
        `結論から言うと、${baseSubject}は日常生活の中でよく使われるものです。`,
        `理由は、特徴がわかりやすく、使い方も説明しやすいからです。`,
        `例えば、基本的な役割や便利な点を順番に話すと、聞き手が理解しやすくなります。`,
        `つまり、${emphasis}`,
      ].join('');
    }

    if (selectedModelId === 'scqa') {
      return [
        `現在、${baseSubject}は身近なテーマとしてよく取り上げられます。`,
        `しかし、特徴を整理しないと説明が曖昧になるという課題があります。`,
        `そこで、基本的な役割、使い方、便利な点の順に説明するとわかりやすくなります。`,
        `答えとしては、${emphasis}`,
      ].join('');
    }

    return [
      `まず、${baseSubject}が何かを簡単に説明します。`,
      `次に、主な特徴や使い方を順番に伝えます。`,
      `最後に、日常生活でどのように役立つかをまとめます。`,
      emphasis,
    ].join('');
  }
}
