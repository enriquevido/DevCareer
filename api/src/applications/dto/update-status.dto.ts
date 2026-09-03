import { ApplicationStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { trimOptionalText } from '../../common/validation/text.transformers';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  note?: string | null;
}
