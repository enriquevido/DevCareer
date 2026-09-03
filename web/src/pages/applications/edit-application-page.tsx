import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  ApplicationWithEvents,
  UpdateApplicationInput,
} from "@/domain/application";
import {
  ApplicationForm,
  applicationQueryKeys,
  fetchApplication,
  getApplicationErrorMessage,
  getApplicationFormValues,
  toUpdateApplicationInput,
  updateApplication,
} from "@/features/applications";
import type { ApplicationFormValues } from "@/features/applications";

type EditApplicationErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

function EditApplicationErrorState({
  message,
  onRetry,
}: EditApplicationErrorStateProps) {
  return (
    <section
      aria-labelledby="edit-application-error-title"
      className="border-y border-line py-8"
      role="alert"
    >
      <h2
        className="text-sm font-semibold text-foreground"
        id="edit-application-error-title"
      >
        No pudimos cargar la postulación
      </h2>

      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
        {message}
      </p>

      {onRetry ? (
        <button
          className={[
            "mt-4",
            "inline-flex",
            "h-9",
            "items-center",
            "gap-2",
            "rounded-sm",
            "border",
            "border-line-strong",
            "bg-transparent",
            "px-3",
            "text-sm",
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
          <RefreshCw aria-hidden="true" className="size-4" strokeWidth={1.8} />
          Reintentar
        </button>
      ) : null}
    </section>
  );
}

export function EditApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { applicationId } = useParams<{
    applicationId: string;
  }>();

  const applicationQuery = useQuery({
    queryKey: applicationQueryKeys.detail(applicationId ?? "missing"),
    queryFn: () => {
      if (!applicationId) {
        throw new Error("An application id is required.");
      }

      return fetchApplication(applicationId);
    },
    enabled: Boolean(applicationId),
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateApplicationInput) => {
      if (!applicationId) {
        throw new Error("An application id is required.");
      }

      return updateApplication(applicationId, input);
    },
  });

  const application = applicationQuery.data ?? null;

  const initialValues = useMemo<ApplicationFormValues | null>(
    () => (application ? getApplicationFormValues(application) : null),
    [application],
  );

  async function handleSubmit(values: ApplicationFormValues): Promise<void> {
    if (!applicationId || !initialValues) {
      throw new Error("The application could not be updated.");
    }

    const input = toUpdateApplicationInput(values, initialValues);

    const updatedApplication = await updateMutation.mutateAsync(input);

    queryClient.setQueryData<ApplicationWithEvents>(
      applicationQueryKeys.detail(applicationId),
      (currentApplication) => {
        if (!currentApplication) {
          return currentApplication;
        }

        return {
          ...currentApplication,
          ...updatedApplication,
          events: currentApplication.events,
        };
      },
    );

    void queryClient.invalidateQueries({
      queryKey: applicationQueryKeys.lists(),
    });

    void navigate(`/applications/${applicationId}`, {
      replace: true,
    });
  }

  const serverError = updateMutation.isError
    ? getApplicationErrorMessage(
        updateMutation.error,
        "No pudimos actualizar la postulación. Intenta nuevamente.",
      )
    : null;

  if (!applicationId) {
    return (
      <div className="w-full min-w-0">
        <header className="border-b border-line pb-5">
          <h1 className="text-xl font-semibold text-foreground">
            Editar postulación
          </h1>
        </header>

        <div className="mt-6">
          <EditApplicationErrorState message="La dirección no contiene un identificador de postulación válido." />
        </div>
      </div>
    );
  }

  if (applicationQuery.isPending) {
    return (
      <div className="w-full min-w-0">
        <header className="border-b border-line pb-5">
          <h1 className="text-xl font-semibold text-foreground">
            Editar postulación
          </h1>
        </header>

        <div aria-live="polite" className="mt-6 border-y border-line py-8">
          <p className="text-sm text-foreground-muted">
            Consultando la postulación…
          </p>
        </div>
      </div>
    );
  }

  if (applicationQuery.isError) {
    const message = getApplicationErrorMessage(
      applicationQuery.error,
      "No pudimos obtener los datos de la postulación.",
    );

    return (
      <div className="w-full min-w-0">
        <header className="border-b border-line pb-5">
          <h1 className="text-xl font-semibold text-foreground">
            Editar postulación
          </h1>
        </header>

        <div className="mt-6">
          <EditApplicationErrorState
            message={message}
            onRetry={() => {
              void applicationQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (!application || !initialValues) {
    return null;
  }

  return (
    <div className="w-full min-w-0">
      <header className="border-b border-line pb-5">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
          Editar postulación
        </h1>

        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-foreground-muted">
          {application.company} · {application.jobTitle}
        </p>
      </header>

      <div>
        <ApplicationForm
          initialValues={initialValues}
          isSubmitting={updateMutation.isPending}
          key={application.id}
          mode="edit"
          onCancel={() => {
            void navigate(`/applications/${application.id}`);
          }}
          onSubmit={handleSubmit}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
