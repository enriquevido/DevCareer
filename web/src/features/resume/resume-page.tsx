import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import {
  fetchCurrentResume,
  fetchResumeSource,
  getResumeSourceDownloadUrl,
  resumeQueryKeys,
  uploadResume,
} from "./resume-api";
import { getResumeErrorMessage } from "./resume-error";
import { ResumeMetadata } from "./resume-metadata";
import { ResumeSourceViewer } from "./resume-source-viewer";
import { ResumeUploadForm } from "./resume-upload-form";

type ResumeRequestErrorProps = {
  message: string;
  onRetry: () => void;
};

function ResumePageHeader() {
  return (
    <header className="border-b border-line pb-5">
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        CV maestro
      </h1>

      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-foreground-muted">
        Administra el documento LaTeX que se utilizará como fuente para producir
        versiones adaptadas de tu CV.
      </p>
    </header>
  );
}

function ResumeLoadingState() {
  return (
    <div aria-live="polite" className="border-y border-line py-8">
      <p className="text-sm text-foreground-muted">
        Consultando el CV maestro…
      </p>
    </div>
  );
}

function ResumeRequestError({ message, onRetry }: ResumeRequestErrorProps) {
  return (
    <section
      aria-labelledby="resume-request-error-title"
      className="border-y border-line py-8"
      role="alert"
    >
      <h2
        className="text-sm font-semibold text-foreground"
        id="resume-request-error-title"
      >
        No pudimos consultar el CV maestro
      </h2>

      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
        {message}
      </p>

      <button
        className={[
          "mt-4",
          "inline-flex",
          "h-8",
          "items-center",
          "gap-2",
          "rounded-sm",
          "border",
          "border-line-strong",
          "bg-transparent",
          "px-2.5",
          "text-xs",
          "font-medium",
          "text-foreground",
          "transition-colors",
          "duration-150",
          "hover:bg-surface-hover",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-accent",
          "motion-reduce:transition-none",
        ].join(" ")}
        onClick={onRetry}
        type="button"
      >
        <RefreshCw aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
        Reintentar
      </button>
    </section>
  );
}

export function ResumePage() {
  const queryClient = useQueryClient();

  const currentResumeQuery = useQuery({
    queryKey: resumeQueryKeys.current(),
    queryFn: fetchCurrentResume,
  });

  const currentResume = currentResumeQuery.data ?? null;
  const currentResumeId = currentResume?.id ?? null;

  const sourceQuery = useQuery({
    queryKey: resumeQueryKeys.source(currentResumeId ?? "not-available"),
    queryFn: () => {
      if (!currentResumeId) {
        throw new Error("A resume id is required to fetch its source.");
      }

      return fetchResumeSource(currentResumeId);
    },
    enabled: currentResumeId !== null,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: (uploadedResume) => {
      queryClient.setQueryData(resumeQueryKeys.current(), uploadedResume);
    },
  });

  async function handleUpload(file: File): Promise<void> {
    await uploadMutation.mutateAsync(file);
  }

  const uploadErrorMessage = uploadMutation.isError
    ? getResumeErrorMessage(
        uploadMutation.error,
        "No pudimos cargar el archivo. Revisa su contenido e intenta nuevamente.",
      )
    : null;

  if (currentResumeQuery.isPending) {
    return (
      <div className="w-full min-w-0">
        <ResumePageHeader />

        <div className="mt-6">
          <ResumeLoadingState />
        </div>
      </div>
    );
  }

  if (currentResumeQuery.isError) {
    const currentResumeErrorMessage = getResumeErrorMessage(
      currentResumeQuery.error,
      "No pudimos obtener la información del CV maestro.",
    );

    return (
      <div className="w-full min-w-0">
        <ResumePageHeader />

        <div className="mt-6">
          <ResumeRequestError
            message={currentResumeErrorMessage}
            onRetry={() => {
              void currentResumeQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (!currentResume) {
    return (
      <div className="w-full min-w-0">
        <ResumePageHeader />

        <div className="py-7">
          <h2 className="text-sm font-semibold text-foreground">
            Aún no hay un documento fuente
          </h2>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
            Carga un documento LaTeX completo para comenzar a generar versiones
            adaptadas de tu CV.
          </p>
        </div>

        <ResumeUploadForm
          errorMessage={uploadErrorMessage}
          hasCurrentResume={false}
          isUploading={uploadMutation.isPending}
          onUpload={handleUpload}
        />
      </div>
    );
  }

  const sourceErrorMessage = sourceQuery.isError
    ? getResumeErrorMessage(
        sourceQuery.error,
        "No pudimos obtener el contenido del archivo.",
      )
    : null;

  return (
    <div className="w-full min-w-0">
      <ResumePageHeader />

      <div className="mt-6 space-y-6">
        <ResumeMetadata resume={currentResume} />

        <ResumeUploadForm
          errorMessage={uploadErrorMessage}
          hasCurrentResume
          isUploading={uploadMutation.isPending}
          onUpload={handleUpload}
        />

        <ResumeSourceViewer
          downloadUrl={getResumeSourceDownloadUrl(currentResume.id)}
          errorMessage={sourceErrorMessage}
          fileName={currentResume.originalName}
          isLoading={sourceQuery.isPending}
          onRetry={() => {
            void sourceQuery.refetch();
          }}
          source={sourceQuery.data}
        />
      </div>
    </div>
  );
}
