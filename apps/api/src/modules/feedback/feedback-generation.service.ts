import { Injectable, Logger } from '@nestjs/common';

import type { StoredAttempt } from '../attempts/attempt-store.service';
import type { StoredSession } from '../sessions/session-store.service';

type ThemeKeywords = string[];
type FeedbackProviderId = 'rule' | 'openai';

export interface FeedbackGenerationResult {
  totalScore: number;
  modelFitScore: number;
  topicCoverageScore: number;
  structureScore: number;
  grammarScore: number;
  clarityScore: number;
  strengths: string[];
  improvementPoints: string[];
  retryFocusPoints: string[];
  improvedAnswerExample: string;
  recommendReason: string | null;
  isPerfectScore: boolean;
  completionThresholdSnapshot: number;
  aiProvider: string;
  aiModel: string;
  promptVersion: string;
  rubricVersion: string;
  generationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  rawResponseJson: Record<string, unknown>;
}

const DEFAULT_FEEDBACK_PROVIDER: FeedbackProviderId = 'rule';

@Injectable()
export class FeedbackGenerationService {
  private readonly logger = new Logger(FeedbackGenerationService.name);

  generateFeedback(input: {
    attempt: StoredAttempt;
    session: StoredSession;
    themeKeywords: ThemeKeywords;
  }): Promise<FeedbackGenerationResult> | FeedbackGenerationResult {
    const provider = this.resolveProvider();

    if (provider === 'rule') {
      return this.generateWithRuleProvider(input);
    }

    return this.generateWithOpenAiFallback(input);
  }

  private resolveProvider(): FeedbackProviderId {
    const configuredProvider = process.env.FEEDBACK_PROVIDER?.trim().toLowerCase();

    if (configuredProvider === 'openai') {
      return 'openai';
    }

    if (configuredProvider === 'rule' || !configuredProvider) {
      return DEFAULT_FEEDBACK_PROVIDER;
    }

    return DEFAULT_FEEDBACK_PROVIDER;
  }

  private generateWithRuleProvider(input: {
    attempt: StoredAttempt;
    session: StoredSession;
    themeKeywords: ThemeKeywords;
  }): FeedbackGenerationResult {
    const transcript = input.attempt.transcriptText;
    const transcriptLength = transcript.length;
    const lowerTranscript = transcript.toLowerCase();
    const modelFitScore = this.computeModelFitScore(input.session.selectedModelId, lowerTranscript);
    const topicCoverageScore = this.computeTopicCoverageScore(input.themeKeywords, transcript);
    const structureScore = this.computeStructureScore(input.session.selectedModelId, transcript);
    const grammarScore = this.computeGrammarScore(transcript);
    const clarityScore = this.computeClarityScore(transcriptLength);
    const totalScore =
      modelFitScore + topicCoverageScore + structureScore + grammarScore + clarityScore;
    const isPerfectScore = totalScore >= input.session.completionThreshold;
    const strengths = this.buildStrengths({
      modelFitScore,
      topicCoverageScore,
      structureScore,
      grammarScore,
      clarityScore,
    });
    const improvementPoints = this.buildImprovementPoints({
      modelFitScore,
      topicCoverageScore,
      structureScore,
      grammarScore,
      clarityScore,
      selectedModelId: input.session.selectedModelId,
      transcript,
    });
    const retryFocusPoints = improvementPoints.slice(0, 3);
    const improvedAnswerExample = this.buildImprovedAnswerExample(
      transcript,
      input.session.selectedModelId,
    );
    const recommendReason = isPerfectScore
      ? '今回のテーマは完成基準に達しました。次の関連テーマに進みましょう。'
      : '前回のスコアが100点未満のため、同じテーマでもう一度練習しましょう。';

    return {
      totalScore,
      modelFitScore,
      topicCoverageScore,
      structureScore,
      grammarScore,
      clarityScore,
      strengths,
      improvementPoints,
      retryFocusPoints,
      improvedAnswerExample,
      recommendReason,
      isPerfectScore,
      completionThresholdSnapshot: input.session.completionThreshold,
      aiProvider: 'rule',
      aiModel: 'prototype-v1',
      promptVersion: 'feedback-prompt-v1',
      rubricVersion: 'rubric-v1',
      generationStatus: 'completed',
      rawResponseJson: {
        totalScore,
        modelFitScore,
        topicCoverageScore,
        structureScore,
        grammarScore,
        clarityScore,
        strengths,
        improvementPoints,
        retryFocusPoints,
      },
    };
  }

  private async generateWithOpenAiFallback(input: {
    attempt: StoredAttempt;
    session: StoredSession;
    themeKeywords: ThemeKeywords;
  }): Promise<FeedbackGenerationResult> {
    try {
      return await this.generateWithOpenAiProvider(input);
    } catch (error: unknown) {
      this.logger.warn(
        `OpenAI feedback fallback activated: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    const feedback = this.generateWithRuleProvider(input);

    return {
      ...feedback,
      aiProvider: 'openai-fallback-rule',
      aiModel: process.env.OPENAI_FEEDBACK_MODEL?.trim() || 'gpt-4.1-mini',
      promptVersion: 'feedback-prompt-openai-v1',
      rawResponseJson: {
        ...feedback.rawResponseJson,
        providerMode: 'fallback',
        requestedProvider: 'openai',
      },
    };
  }

  private async generateWithOpenAiProvider(input: {
    attempt: StoredAttempt;
    session: StoredSession;
    themeKeywords: ThemeKeywords;
  }): Promise<FeedbackGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }

    const model = process.env.OPENAI_FEEDBACK_MODEL?.trim() || 'gpt-4.1-mini';
    const completionThreshold = input.session.completionThreshold;
    const requestBody = {
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                'You evaluate Japanese explanation practice. Return JSON only. Follow the requested schema exactly. Scores must sum to 100. Base the scoring on the provided rubric and keep suggestions concise and actionable in Japanese.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(
                {
                  selectedModelId: input.session.selectedModelId,
                  completionThreshold,
                  themeKeywords: input.themeKeywords,
                  transcriptText: input.attempt.transcriptText,
                  rubric: {
                    modelFitScore: 50,
                    topicCoverageScore: 10,
                    structureScore: 5,
                    grammarScore: 10,
                    clarityScore: 25,
                  },
                },
                null,
                2,
              ),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'feedback_result',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              totalScore: { type: 'integer' },
              modelFitScore: { type: 'integer' },
              topicCoverageScore: { type: 'integer' },
              structureScore: { type: 'integer' },
              grammarScore: { type: 'integer' },
              clarityScore: { type: 'integer' },
              strengths: { type: 'array', items: { type: 'string' } },
              improvementPoints: { type: 'array', items: { type: 'string' } },
              retryFocusPoints: { type: 'array', items: { type: 'string' } },
              improvedAnswerExample: { type: 'string' },
              recommendReason: { type: 'string' },
            },
            required: [
              'totalScore',
              'modelFitScore',
              'topicCoverageScore',
              'structureScore',
              'grammarScore',
              'clarityScore',
              'strengths',
              'improvementPoints',
              'retryFocusPoints',
              'improvedAnswerExample',
              'recommendReason',
            ],
          },
        },
      },
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenAI feedback request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const outputText = this.extractOutputText(payload);

    if (!outputText) {
      throw new Error('OpenAI feedback response did not contain JSON output text.');
    }

    const parsed = JSON.parse(outputText) as {
      totalScore: number;
      modelFitScore: number;
      topicCoverageScore: number;
      structureScore: number;
      grammarScore: number;
      clarityScore: number;
      strengths: string[];
      improvementPoints: string[];
      retryFocusPoints: string[];
      improvedAnswerExample: string;
      recommendReason: string;
    };
    const totalScore = this.clamp(parsed.totalScore, 0, 100);
    const modelFitScore = this.clamp(parsed.modelFitScore, 0, 50);
    const topicCoverageScore = this.clamp(parsed.topicCoverageScore, 0, 10);
    const structureScore = this.clamp(parsed.structureScore, 0, 5);
    const grammarScore = this.clamp(parsed.grammarScore, 0, 10);
    const clarityScore = this.clamp(parsed.clarityScore, 0, 25);

    return {
      totalScore,
      modelFitScore,
      topicCoverageScore,
      structureScore,
      grammarScore,
      clarityScore,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      improvementPoints: Array.isArray(parsed.improvementPoints)
        ? parsed.improvementPoints.map(String)
        : [],
      retryFocusPoints: Array.isArray(parsed.retryFocusPoints)
        ? parsed.retryFocusPoints.map(String)
        : [],
      improvedAnswerExample: String(parsed.improvedAnswerExample ?? ''),
      recommendReason: String(parsed.recommendReason ?? ''),
      isPerfectScore: totalScore >= completionThreshold,
      completionThresholdSnapshot: completionThreshold,
      aiProvider: 'openai',
      aiModel: model,
      promptVersion: 'feedback-prompt-openai-v1',
      rubricVersion: 'rubric-v1',
      generationStatus: 'completed',
      rawResponseJson: payload,
    };
  }

  private extractOutputText(payload: Record<string, unknown>) {
    if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
      return payload.output_text.trim();
    }

    const output = payload.output;

    if (!Array.isArray(output)) {
      return '';
    }

    for (const item of output) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const content = (item as { content?: unknown }).content;

      if (!Array.isArray(content)) {
        continue;
      }

      for (const part of content) {
        if (!part || typeof part !== 'object') {
          continue;
        }

        const text = (part as { text?: unknown }).text;

        if (typeof text === 'string' && text.trim()) {
          return text.trim();
        }
      }
    }

    return '';
  }

  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  private computeModelFitScore(selectedModelId: string, transcript: string) {
    if (selectedModelId === 'prep') {
      const hasReason = transcript.includes('理由') || transcript.includes('なぜなら');
      const hasExample = transcript.includes('例えば') || transcript.includes('たとえば');
      return 30 + (hasReason ? 10 : 0) + (hasExample ? 10 : 0);
    }

    if (selectedModelId === 'scqa') {
      const hasSituation = transcript.includes('状況') || transcript.includes('現在');
      const hasIssue = transcript.includes('問題') || transcript.includes('課題');
      return 30 + (hasSituation ? 10 : 0) + (hasIssue ? 10 : 0);
    }

    const hasSequence = ['まず', '次に', '最後に'].filter((word) =>
      transcript.includes(word),
    ).length;
    return 30 + Math.min(hasSequence * 10, 20);
  }

  private computeTopicCoverageScore(keywords: string[], transcript: string) {
    if (keywords.length === 0) {
      return 5;
    }

    const hits = keywords.filter((keyword) => transcript.includes(keyword)).length;
    return Math.min(10, Math.max(3, Math.round((hits / keywords.length) * 10)));
  }

  private computeStructureScore(selectedModelId: string, transcript: string) {
    if (selectedModelId === 'stepbystep') {
      const sequenceCount = ['まず', '次に', '最後に'].filter((word) =>
        transcript.includes(word),
      ).length;
      return Math.min(5, Math.max(2, sequenceCount + 1));
    }

    if (selectedModelId === 'prep') {
      const markers = ['結論', '理由', '例えば', 'つまり'].filter((word) =>
        transcript.includes(word),
      ).length;
      return Math.min(5, Math.max(2, markers + 1));
    }

    const markers = ['現在', '問題', 'どう', '答え'].filter((word) =>
      transcript.includes(word),
    ).length;
    return Math.min(5, Math.max(2, markers + 1));
  }

  private computeGrammarScore(transcript: string) {
    let score = 8;

    if (transcript.includes('触って操作')) {
      score -= 2;
    }

    if (transcript.endsWith('。')) {
      score += 1;
    }

    return Math.max(4, Math.min(10, score));
  }

  private computeClarityScore(transcriptLength: number) {
    if (transcriptLength >= 80 && transcriptLength <= 180) {
      return 20;
    }

    if (transcriptLength > 180) {
      return 18;
    }

    if (transcriptLength >= 40) {
      return 16;
    }

    return 12;
  }

  private buildStrengths(scores: {
    modelFitScore: number;
    topicCoverageScore: number;
    structureScore: number;
    grammarScore: number;
    clarityScore: number;
  }) {
    const strengths: string[] = [];

    if (scores.modelFitScore >= 40) {
      strengths.push('構造を意識して説明モデルに沿って話せています。');
    }

    if (scores.topicCoverageScore >= 8) {
      strengths.push('テーマに必要なキーワードを押さえて説明できています。');
    }

    if (scores.clarityScore >= 18) {
      strengths.push('全体として伝えたい内容がわかりやすく整理されています。');
    }

    return strengths.length > 0
      ? strengths
      : ['テーマに沿って説明しようとしている点は良いスタートです。'];
  }

  private buildImprovementPoints(input: {
    modelFitScore: number;
    topicCoverageScore: number;
    structureScore: number;
    grammarScore: number;
    clarityScore: number;
    selectedModelId: string;
    transcript: string;
  }) {
    const points: string[] = [];

    if (input.grammarScore < 9 && input.transcript.includes('触って操作')) {
      points.push('「画面を指で触って操作する」より「画面を指で触れて操作する」の方が自然です。');
    }

    if (input.structureScore < 5) {
      if (input.selectedModelId === 'stepbystep') {
        points.push('「まず・次に・最後に」の流れをもっとはっきり入れると、手順構造が伝わりやすくなります。');
      } else if (input.selectedModelId === 'prep') {
        points.push('結論のあとに理由と具体例を明確に入れると、PREPの型にさらに近づきます。');
      } else {
        points.push('背景、課題、答えの流れをもう少し明確にすると、SCQAの型が伝わりやすくなります。');
      }
    }

    if (input.clarityScore < 20) {
      points.push('最後に一文でまとめを入れると、説明全体が締まって聞き手に残りやすくなります。');
    }

    if (input.topicCoverageScore < 9) {
      points.push('テーマに関連する具体的なキーワードをあと1〜2個加えると、内容の網羅性が上がります。');
    }

    return points.length > 0
      ? points
      : ['より自然な表現やまとめの一文を加えると、さらに完成度が上がります。'];
  }

  private buildImprovedAnswerExample(transcript: string, selectedModelId: string) {
    if (selectedModelId === 'stepbystep') {
      return `${transcript} 最後に、このように日常生活でとても便利な道具です。`;
    }

    if (selectedModelId === 'prep') {
      return '結論から言うと、スマートフォンはとても便利な携帯端末です。理由は、連絡や検索、写真撮影まで一台でできるからです。例えば、移動中でも地図を見たり、友達にメッセージを送ったりできます。つまり、日常生活を支える大切な道具です。';
    }

    return '現在、私たちはいつでも情報にアクセスしたいという状況があります。しかし、パソコンだけでは外出先で不便なことがあります。では、どうすればよいでしょうか。答えは、スマートフォンを活用することです。';
  }
}
