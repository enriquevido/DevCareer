# DevCareer

DevCareer is a local web application for managing job applications and adapting a master LaTeX resume to a specific vacancy. It keeps application details, status history, resume versions, and generated CV analyses in one place.

## What the application does

- Creates, edits, searches, and filters job applications.
- Records application status changes in a timeline.
- Stores a master resume as a versioned `.tex` file.
- Uses DeepSeek to compare a job description with the master resume.
- Produces recommendations without inventing unsupported experience.
- Compiles an adapted LaTeX resume into a PDF.
- Lets the user review and select an analysis for an application.

## Architecture

The repository contains three application components and one database:

| Component | Technology | Responsibility | Local address |
| --- | --- | --- | --- |
| `web` | React, TypeScript, Vite | Browser interface | `http://localhost:5173` |
| `api` | NestJS, Prisma | Business rules and HTTP API | `http://localhost:3000/api` |
| `latex-service` | Node.js, pdfLaTeX | Isolated LaTeX-to-PDF compilation | `http://localhost:3001` |
| `db` | PostgreSQL 16 | Persistent application data | `localhost:5432` |

During development, Vite forwards browser requests beginning with `/api` to the NestJS API. The API communicates with PostgreSQL, DeepSeek, and the LaTeX compiler. The browser never connects to those services directly.

## Requirements

Install the following tools before starting:

- Node.js 22 or a newer compatible LTS release.
- npm, included with Node.js.
- Docker with Docker Compose.
- A DeepSeek API key if you want to generate new CV analyses.

The rest of the application can start without a DeepSeek API key. Only analysis generation requires it.

## Local setup

Run the following commands from the repository root unless a step says otherwise.

### 1. Start PostgreSQL and the LaTeX compiler

```bash
docker compose up -d db latex-compiler
```

The first LaTeX image build can take several minutes because it installs the TeX packages needed to compile resumes.

Check that both containers are running:

```bash
docker compose ps
```

The `latex-compiler` service should eventually report `healthy`.

### 2. Configure the API

Create your local environment file from the safe template:

```bash
cp api/.env.example api/.env
```

Open `api/.env` and add your DeepSeek API key:

```dotenv
DEEPSEEK_API_KEY=your_api_key_here
```

Do not commit `api/.env`. It is intentionally ignored because it may contain secrets.

The available API variables are:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `PORT` | No | API port. The default is `3000`. |
| `DEEPSEEK_API_KEY` | For CV analysis | Authenticates requests to DeepSeek. |
| `DEEPSEEK_MODEL` | No | DeepSeek model used for analysis. |
| `LATEX_COMPILER_URL` | No | Address of the LaTeX service. |
| `LATEX_COMPILER_TIMEOUT_MS` | No | Maximum time the API waits for compilation. |

### 3. Install dependencies

Install API dependencies:

```bash
cd api
npm ci
cd ..
```

Install web dependencies:

```bash
cd web
npm ci
cd ..
```

The LaTeX service has no third-party npm dependencies; Docker builds it directly from its source files.

### 4. Prepare the database

Run these commands inside the API directory:

```bash
cd api
npx prisma generate
npx prisma migrate deploy
cd ..
```

`prisma generate` creates the typed database client used by the API. `prisma migrate deploy` applies the committed database migrations to PostgreSQL.

### 5. Optionally load sample data

The seed creates a master resume, two applications with analysis history, and one additional draft application.

> **Warning:** the seed deletes all existing application, timeline, analysis, and resume records before inserting the sample data. Use it only with a development database whose contents you can replace.

```bash
cd api
npm run seed
cd ..
```

## Run the application

Keep Docker running and open two terminals.

In the first terminal, start the API:

```bash
cd api
npm run start:dev
```

In the second terminal, start the web application:

```bash
cd web
npm run dev
```

Open `http://localhost:5173` in your browser.

## Verify the services

Check the LaTeX compiler directly:

```bash
curl http://localhost:3001/health
```

The expected response is:

```json
{"status":"ok"}
```

The API does not expose a general health endpoint. A `404` response from `http://localhost:3000/api` is therefore normal; use the web application to exercise its resource endpoints.

## Code quality commands

Run API checks from `api`:

```bash
npm run format:check
npm run lint
npm run build
```

Run web checks from `web`:

```bash
npm run lint
npm run build
```

Build artifacts are written to each package's `dist` directory and are ignored by Git.

## Production-style local execution

Build and start the API:

```bash
cd api
npm run build
npm run start:prod
```

Build and preview the web application:

```bash
cd web
npm run build
npm run preview
```

Vite preview is useful for checking the production frontend bundle locally. It is not a production web server deployment strategy.

## Common problems

### PostgreSQL cannot bind to port 5432

Another PostgreSQL instance may already be using the port. Stop that instance or change both the Compose port mapping and `DATABASE_URL` to matching values.

### The LaTeX compiler is unhealthy

Inspect its logs:

```bash
docker compose logs latex-compiler
```

Wait for the initial image build to finish, then confirm that `http://localhost:3001/health` responds successfully.

### The API reports that `DATABASE_URL` is required

Confirm that `api/.env` exists and that you started NestJS from the `api` directory.

### CV analysis reports that the API key is not configured

Set `DEEPSEEK_API_KEY` in `api/.env`, then restart the API process so it loads the new value.

### The browser cannot reach the API

Confirm that the API is listening on port `3000`. The development proxy in `web/vite.config.ts` sends `/api` requests to that port.

## Stop local infrastructure

Stop the Docker containers without deleting database data:

```bash
docker compose down
```

The PostgreSQL data remains in the `pgdata` Docker volume for the next startup.
