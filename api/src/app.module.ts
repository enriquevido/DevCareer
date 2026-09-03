import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationsModule } from './applications/applications.module';
import { validateEnvironment } from './config/environment.validation';
import { CvAnalysesModule } from './cv-analyses/cv-analyses.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { FilesModule } from './files/files.module';
import { ResumesModule } from './resumes/resumes.module';
import { LatexModule } from './latex/latex.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    ApplicationsModule,
    FilesModule,
    ResumesModule,
    CvAnalysesModule,
    LatexModule,
  ],
})
export class AppModule {}
