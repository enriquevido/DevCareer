import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  CvAnalysisProvider,
  CvAnalysisProviderResponse,
} from './cv-analysis-provider';
import type { CvAnalysisMessage } from './cv-analysis.types';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-flash';

@Injectable()
export class DeepSeekCvAnalysisProvider implements CvAnalysisProvider {
  readonly model: string;

  private readonly client: OpenAI | null;

  constructor(configService: ConfigService) {
    this.model =
      configService.get<string>('DEEPSEEK_MODEL')?.trim() ||
      DEFAULT_DEEPSEEK_MODEL;

    const apiKey = configService.get<string>('DEEPSEEK_API_KEY')?.trim();

    this.client = apiKey
      ? new OpenAI({
          apiKey,
          baseURL: DEEPSEEK_BASE_URL,
          timeout: 60_000,
          maxRetries: 2,
        })
      : null;
  }

  async generate(
    messages: readonly CvAnalysisMessage[],
  ): Promise<CvAnalysisProviderResponse> {
    if (!this.client) {
      throw new Error('DEEPSEEK_API_KEY is not configured.');
    }

    const requestMessages = messages.map((message) =>
      message.role === 'system'
        ? {
            role: 'system' as const,
            content: message.content,
          }
        : {
            role: 'user' as const,
            content: message.content,
          },
    );

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: requestMessages,
      response_format: {
        type: 'json_object',
      },
      max_tokens: 8192,
      stream: false,
    });

    return {
      model: completion.model,
      content: completion.choices[0]?.message.content ?? '',
    };
  }
}
