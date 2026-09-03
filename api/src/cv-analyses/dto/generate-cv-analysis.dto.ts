import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trimOptionalText } from '../../common/validation/text.transformers';

export class GenerateCvAnalysisDto {
  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  resumeVersionId?: string | null;
}
