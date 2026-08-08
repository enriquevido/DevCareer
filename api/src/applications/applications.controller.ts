import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const application = await this.applicationsService.findOne(id);
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    const application = await this.applicationsService.update(id, dto);
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  @Patch(':id/status')
  async changeStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const application = await this.applicationsService.changeStatus(id, dto);
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
