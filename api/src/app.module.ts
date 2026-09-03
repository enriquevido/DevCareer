import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ApplicationsModule } from './applications/applications.module';
import { PrismaExceptionFilter } from './common/http/prisma-exception.filter';
import { validateEnvironment } from './config/environment.validation';
import { CvAnalysesModule } from './cv-analyses/cv-analyses.module';
import { ResumesModule } from './resumes/resumes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ApplicationsModule,
    ResumesModule,
    CvAnalysesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
