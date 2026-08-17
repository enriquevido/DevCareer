import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

const masterResumeSource = String.raw`\documentclass[10pt]{article}
  \usepackage[margin=0.7in]{geometry}

  \begin{document}

  \section*{Alex Rivera}

  Software engineering student focused on backend development and web applications.

  \section*{Experience}

  \begin{itemize}
    \item Built REST APIs with TypeScript, NestJS, Prisma, and PostgreSQL.
    \item Created React interfaces and integrated them with HTTP APIs.
    \item Containerized development services with Docker Compose.
  \end{itemize}

  \section*{Projects}

  \begin{itemize}
    \item Developed a job application tracker with status history and PDF storage.
    \item Added unit tests for backend services using Jest.
  \end{itemize}

  \section*{Education}

  Bachelor's degree student in Software Engineering.

  \end{document}
  `;

const derivedResumeSource = masterResumeSource.replace(
  'Built REST APIs with TypeScript, NestJS, Prisma, and PostgreSQL.',
  'Built and tested REST APIs with TypeScript, NestJS, Prisma, and PostgreSQL.',
);

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

async function clearDatabase() {
  await prisma.application.updateMany({
    data: { selectedCvAnalysisId: null },
  });

  await prisma.cvAnalysis.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resumeVersion.deleteMany();
}

async function main() {
  await clearDatabase();

  const resumeVersion = await prisma.resumeVersion.create({
    data: {
      originalName: 'alex-rivera-resume.tex',
      source: masterResumeSource,
      sha256: sha256(masterResumeSource),
      createdAt: new Date('2026-08-01T09:00:00Z'),
    },
  });

  await prisma.application.create({
    data: {
      company: 'Northstar Labs',
      jobTitle: 'Frontend Engineer Intern',
      jobUrl: 'https://example.com/jobs/frontend-engineer-intern',
      description:
        'Build accessible React interfaces using TypeScript and integrate them with REST APIs. Experience with automated testing is valued.',
      location: 'Remote',
      isRemote: true,
      source: 'Company website',
      notes: 'Review the portfolio before requesting a CV analysis.',
      status: 'DRAFT',
      createdAt: new Date('2026-08-02T10:00:00Z'),
      events: {
        create: {
          status: 'DRAFT',
          note: 'Application draft created',
          createdAt: new Date('2026-08-02T10:00:00Z'),
        },
      },
    },
  });

  const backendApplication = await prisma.application.create({
    data: {
      company: 'Cedar Systems',
      jobTitle: 'Backend Engineer Intern',
      jobUrl: 'https://example.com/jobs/backend-engineer-intern',
      description:
        'Develop and test REST APIs using TypeScript, PostgreSQL, and Docker. Familiarity with NestJS and Prisma is preferred.',
      location: 'Mexico City',
      isRemote: true,
      salaryRange: 'MXN 18,000 - 22,000/month',
      source: 'University portal',
      notes: 'The vacancy closely matches the current backend project.',
      status: 'APPLIED',
      createdAt: new Date('2026-08-03T11:00:00Z'),
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application draft created',
            createdAt: new Date('2026-08-03T11:00:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Application submitted through the university portal',
            createdAt: new Date('2026-08-05T16:30:00Z'),
          },
        ],
      },
    },
  });

  await prisma.cvAnalysis.create({
    data: {
      applicationId: backendApplication.id,
      resumeVersionId: resumeVersion.id,
      status: 'COMPILE_FAILED',
      model: 'deepseek-v4-flash',
      summaryEs:
        'El CV ya coincide con las tecnologias principales de la vacante. La recomendacion valida refuerza la experiencia de pruebas sin agregar herramientas nuevas.',
      recommendations: {
        matchedKeywords: [
          'TypeScript',
          'REST APIs',
          'NestJS',
          'Prisma',
          'PostgreSQL',
          'Docker',
        ],
        missingKeywords: ['CI/CD'],
        warningsEs: [
          'CI/CD aparece en la vacante, pero no esta respaldado por el CV maestro.',
        ],
        recommendations: [
          {
            section: 'Experience',
            originalText:
              'Built REST APIs with TypeScript, NestJS, Prisma, and PostgreSQL.',
            replacementText:
              'Built and tested REST APIs with TypeScript, NestJS, Prisma, and PostgreSQL.',
            rationaleEs:
              'La nueva redaccion incorpora la palabra clave tested, respaldada por la seccion de proyectos del CV.',
            matchedKeywords: ['tested', 'REST APIs'],
            validation: {
              status: 'APPLIED',
              reason: null,
            },
          },
        ],
      },
      derivedSource: derivedResumeSource,
      errorMessage:
        'LaTeX compilation is unavailable until the compilation milestone is implemented.',
      createdAt: new Date('2026-08-04T12:00:00Z'),
    },
  });

  const platformApplication = await prisma.application.create({
    data: {
      company: 'Orbit Data',
      jobTitle: 'Platform Engineering Intern',
      jobUrl: 'https://example.com/jobs/platform-engineering-intern',
      description:
        'Support containerized services, CI/CD pipelines, cloud infrastructure, and production monitoring.',
      location: 'Monterrey',
      isRemote: false,
      source: 'LinkedIn',
      notes:
        'The vacancy contains several requirements that are not present in the current CV.',
      status: 'RESPONSE_RECEIVED',
      createdAt: new Date('2026-08-06T08:30:00Z'),
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application draft created',
            createdAt: new Date('2026-08-06T08:30:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Application submitted through LinkedIn',
            createdAt: new Date('2026-08-07T14:00:00Z'),
          },
          {
            status: 'RESPONSE_RECEIVED',
            note: 'Recruiter requested additional availability information',
            createdAt: new Date('2026-08-09T17:15:00Z'),
          },
        ],
      },
    },
  });

  await prisma.cvAnalysis.create({
    data: {
      applicationId: platformApplication.id,
      resumeVersionId: resumeVersion.id,
      status: 'AI_FAILED',
      model: 'deepseek-v4-flash',
      errorMessage: 'Mocked AI provider failure for development seed data.',
      createdAt: new Date('2026-08-08T15:00:00Z'),
    },
  });

  console.log(
    'Seed finished: 1 resume version, 3 applications, and 2 CV analyses created.',
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
