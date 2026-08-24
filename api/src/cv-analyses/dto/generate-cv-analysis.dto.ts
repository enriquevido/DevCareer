import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateCvAnalysisDto {
  @IsString()
  @IsNotEmpty()
  resumeVersionId!: string;
}
