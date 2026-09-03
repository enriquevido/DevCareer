import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  trimOptionalText,
  trimText,
} from '../../common/validation/text.transformers';

export class CreateApplicationDto {
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  company!: string;

  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  jobTitle!: string;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  @MaxLength(2048)
  jobUrl?: string | null;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  description?: string | null;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  salaryRange?: string | null;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source?: string | null;

  @Transform(trimOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  notes?: string | null;
}
