import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateSuggestionDto } from './dto/generate-suggestion.dto';

@Controller('applications/:id/suggestions')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  generate(@Param('id') id: string, @Body() dto: GenerateSuggestionDto) {
    return this.aiService.generate(id, dto);
  }

  @Get()
  list(@Param('id') id: string) {
    return this.aiService.findByApplication(id);
  }
}
