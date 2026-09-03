import { ApplicationStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { trimOptionalText } from '../../common/validation/text.transformers';

export class QueryApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string | null;
}
