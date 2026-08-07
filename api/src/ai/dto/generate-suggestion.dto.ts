import { IsEnum } from 'class-validator';

export enum SuggestionType {
  COVER_LETTER = 'cover_letter',
  INTERVIEW_QUESTIONS = 'interview_questions',
  RESUME_MATCH = 'resume_match',
}

export class GenerateSuggestionDto {
  @IsEnum(SuggestionType)
  type!: SuggestionType;
}
