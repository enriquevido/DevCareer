import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  GenerateSuggestionDto,
  SuggestionType,
} from './dto/generate-suggestion.dto';

const PROMPTS: Record<SuggestionType, string> = {
  cover_letter: 'Write a short cover letter tailored to the job description.',
  interview_questions: 'List 5-8 likely interview questions for this vacancy.',
  resume_match:
    'Analyze the CV against the description: highlight matching points and missing gaps.',
};

@Injectable()
export class AiService {
  private readonly client: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async generate(applicationId: string, dto: GenerateSuggestionDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    const completion = await this.client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for a job search tracker.',
        },
        {
          role: 'user',
          content:
            `${PROMPTS[dto.type]}\n\n` +
            `Company: ${application.company}\n` +
            `Job title: ${application.jobTitle}\n\n` +
            `Description:\n${application.description ?? 'No description provided.'}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';

    return this.prisma.aiSuggestion.create({
      data: { applicationId, type: dto.type, content },
    });
  }

  findByApplication(applicationId: string) {
    return this.prisma.aiSuggestion.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
