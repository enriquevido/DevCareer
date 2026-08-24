import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { CvAnalysesModule } from './cv-analyses/cv-analyses.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResumesModule } from './resumes/resumes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ApplicationsModule,
    FilesModule,
    ResumesModule,
    CvAnalysesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
