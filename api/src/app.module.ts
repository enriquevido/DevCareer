import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResumesModule } from './resumes/resumes.module';

@Module({
  imports: [PrismaModule, ApplicationsModule, FilesModule, ResumesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
