import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.timelineEvent.deleteMany();
  await prisma.application.deleteMany();

  await prisma.application.create({
    data: {
      company: 'Spotify',
      jobTitle: 'Frontend Engineer Intern',
      jobUrl: 'https://www.lifeatspotify.com/jobs/frontend-intern',
      description:
        'Build and improve features for the spotify web player using React and TypeScript. Collaborate with designers and product managers in an agile team.',
      location: 'Stockholm',
      isRemote: true,
      salaryRange: '$30 - $40/hr',
      source: 'LinkedIn',
      notes:
        'Update CV to highlight audio streaming experience before applying.',
      status: 'DRAFT',
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application started',
            createdAt: new Date('2026-08-06T09:00:00Z'),
          },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      company: 'Google',
      jobTitle: 'Software Engineer Intern',
      jobUrl: 'https://careers.google.com/jobs/software-engineer-intern',
      description:
        'Work on distributed systems that power Google Search. Interns get a dedicated mentor and a real production project.',
      location: 'Remote',
      isRemote: true,
      salaryRange: '$45 - $55/hr',
      source: 'University portal',
      status: 'APPLIED',
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application started',
            createdAt: new Date('2026-07-20T10:00:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Applied through the university career portal',
            createdAt: new Date('2026-07-21T14:30:00Z'),
          },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      company: 'Shopify',
      jobTitle: 'Backend Developer Intern',
      jobUrl: 'https://www.shopify.com/careers/backend-intern',
      description:
        'Design and build Ruby on Rails services that power millions of stores. Focus on reliability and performance.',
      location: 'Toronto',
      isRemote: false,
      salaryRange: 'CAD 6,000/month',
      source: 'Company website',
      notes: 'Used the CV version with the Ruby project.',
      status: 'RESPONSE_RECEIVED',
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application started',
            createdAt: new Date('2026-07-10T08:00:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Applied via company career page',
            createdAt: new Date('2026-07-11T18:00:00Z'),
          },
          {
            status: 'RESPONSE_RECEIVED',
            note: 'Recruiter asked about availability for a phone screen',
            createdAt: new Date('2026-07-30T11:15:00Z'),
          },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      company: 'Netflix',
      jobTitle: 'Full-stack Engineer Intern',
      jobUrl: 'https://jobs.netflix.com/internships/fullstack',
      description:
        'Contribute to internal tools used by the content team. Stack: Node.js, React, and GraphQL.',
      location: 'Los Angeles',
      isRemote: false,
      salaryRange: '$60/hr',
      source: 'LinkedIn',
      cvFile: 'netflix-cv-v2.pdf',
      notes: 'CV optimized with GraphQL keywords.',
      status: 'INTERVIEW',
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application started',
            createdAt: new Date('2026-06-25T09:00:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Applied with the v2 CV',
            createdAt: new Date('2026-06-26T13:00:00Z'),
          },
          {
            status: 'RESPONSE_RECEIVED',
            note: 'Email from recruiter to schedule the first interview',
            createdAt: new Date('2026-07-08T16:45:00Z'),
          },
          {
            status: 'INTERVIEW',
            note: 'First round with hiring manager done',
            createdAt: new Date('2026-07-22T15:00:00Z'),
          },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      company: 'Airbnb',
      jobTitle: 'Product Designer Intern',
      jobUrl: 'https://careers.airbnb.com/design-intern',
      description:
        'Help design delightful experiences for hosts and guests. Portfolio review required.',
      location: 'San Francisco',
      isRemote: false,
      source: 'Portfolio review request',
      notes: 'Rejected after the first interview.',
      status: 'REJECTED',
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application started',
            createdAt: new Date('2026-06-10T12:00:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Sent portfolio with the application',
            createdAt: new Date('2026-06-11T09:30:00Z'),
          },
          {
            status: 'RESPONSE_RECEIVED',
            note: 'Invited to portfolio review',
            createdAt: new Date('2026-06-20T14:00:00Z'),
          },
          {
            status: 'REJECTED',
            note: 'Feedback: need more UX case studies',
            createdAt: new Date('2026-07-05T10:00:00Z'),
          },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      company: 'Stripe',
      jobTitle: 'Solutions Engineer Intern',
      jobUrl: 'https://stripe.com/jobs/solutions-engineer-intern',
      description:
        'Help customers integrate Stripe APIs. Strong API and communication skills required.',
      location: 'Remote',
      isRemote: true,
      salaryRange: '$50 - $60/hr',
      source: 'Company website',
      status: 'CLOSED',
      events: {
        create: [
          {
            status: 'DRAFT',
            note: 'Application started',
            createdAt: new Date('2026-05-18T09:00:00Z'),
          },
          {
            status: 'APPLIED',
            note: 'Applied through the careers page',
            createdAt: new Date('2026-05-19T17:00:00Z'),
          },
          {
            status: 'RESPONSE_RECEIVED',
            note: 'Technical screening scheduled',
            createdAt: new Date('2026-05-27T11:00:00Z'),
          },
          {
            status: 'INTERVIEW',
            note: 'Passed technical screen',
            createdAt: new Date('2026-06-03T16:00:00Z'),
          },
          {
            status: 'OFFER',
            note: 'Offer received',
            createdAt: new Date('2026-06-18T13:30:00Z'),
          },
          {
            status: 'CLOSED',
            note: 'Declined offer: accepted another internship',
            createdAt: new Date('2026-06-25T10:30:00Z'),
          },
        ],
      },
    },
  });

  console.log('Seed finished: 6 applications created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
