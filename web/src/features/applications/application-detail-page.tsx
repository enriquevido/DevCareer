import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  ApplicationRecord,
  ApplicationWithEvents,
  CvAnalysisSummary,
  UpdateApplicationStatusInput,
} from "../../types/api";
import {
  applicationQueryKeys,
  changeApplicationStatus,
  deleteApplication,
  fetchApplication,
} from "./application-api";
import { ApplicationAnalysisHistory } from "./application-analysis-history";
import { ApplicationDetailHeader } from "./application-detail-header";
import {
  ApplicationDetailErrorState,
  ApplicationDetailLoadingState,
} from "./application-detail-page-state";
import { ApplicationDetailsPanel } from "./application-details-panel";
import { getApplicationErrorMessage } from "./application-error";
import { ApplicationTimeline } from "./application-timeline";
import { ChangeApplicationStatusDialog } from "./change-application-status-dialog";
import {
  cvAnalysisQueryKeys,
  fetchApplicationCvAnalyses,
} from "./cv-analysis-api";
import { DeleteApplicationDialog } from "./delete-application-dialog";
import { useGenerateApplicationCvAnalysis } from "./use-generate-application-cv-analysis";

const EMPTY_ANALYSES: readonly CvAnalysisSummary[] = [];

type AnalysisQueryStateProps = {
  errorMessage: string | null;
  isError: boolean;
  isPending: boolean;
  onRetry: () => void;
};

function AnalysisQueryState({
  errorMessage,
  isError,
  isPending,
  onRetry,
}: AnalysisQueryStateProps) {
  if (isPending) {
    return (
      <section aria-live="polite" className="border border-line bg-surface">
        <header className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Análisis del CV
          </h2>
        </header>

        <div className="px-4 py-6">
          <p className="text-sm text-foreground-muted">Consultando análisis…</p>
        </div>
      </section>
    );
  }

  if (isError && errorMessage) {
    return (
      <section
        aria-labelledby="application-analyses-error-title"
        className="border border-line bg-surface"
        role="alert"
      >
        <header className="border-b border-line px-4 py-3">
          <h2
            className="text-sm font-semibold text-foreground"
            id="application-analyses-error-title"
          >
            No pudimos cargar los análisis
          </h2>
        </header>

        <div className="px-4 py-6">
          <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
            {errorMessage}
          </p>

          <button
            className={[
              "mt-4",
              "inline-flex",
              "h-9",
              "items-center",
              "justify-center",
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
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return null;
}

export function ApplicationDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { applicationId } = useParams<{
    applicationId: string;
  }>();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const analysesQuery = useQuery({
    queryKey: cvAnalysisQueryKeys.listByApplication(applicationId ?? "missing"),
    queryFn: () => {
      if (!applicationId) {
        throw new Error("An application id is required.");
      }

      return fetchApplicationCvAnalyses(applicationId);
    },
    enabled: Boolean(applicationId),
  });

  const statusMutation = useMutation({
    mutationFn: (input: UpdateApplicationStatusInput) => {
      if (!applicationId) {
        throw new Error("An application id is required.");
      }

      return changeApplicationStatus(applicationId, input);
    },
    onSuccess: ([updatedApplication, newEvent]) => {
      if (!applicationId) {
        return;
      }

      queryClient.setQueryData<ApplicationWithEvents>(
        applicationQueryKeys.detail(applicationId),
        (currentApplication) => ({
          ...updatedApplication,
          events: currentApplication
            ? [
                newEvent,
                ...currentApplication.events.filter(
                  (event) => event.id !== newEvent.id,
                ),
              ]
            : [newEvent],
        }),
      );

      void queryClient.invalidateQueries({
        queryKey: applicationQueryKeys.lists(),
      });

      setIsStatusDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!applicationId) {
        throw new Error("An application id is required.");
      }

      return deleteApplication(applicationId);
    },
    onSuccess: () => {
      if (!applicationId) {
        return;
      }

      queryClient.setQueriesData<ApplicationRecord[]>(
        {
          queryKey: applicationQueryKeys.lists(),
        },
        (currentApplications) =>
          currentApplications?.filter(
            (application) => application.id !== applicationId,
          ),
      );

      queryClient.removeQueries({
        exact: true,
        queryKey: applicationQueryKeys.detail(applicationId),
      });

      queryClient.removeQueries({
        exact: true,
        queryKey: cvAnalysisQueryKeys.listByApplication(applicationId),
      });

      for (const analysis of analysesQuery.data ?? EMPTY_ANALYSES) {
        queryClient.removeQueries({
          exact: true,
          queryKey: cvAnalysisQueryKeys.detail(analysis.id),
        });
      }

      void queryClient.invalidateQueries({
        queryKey: applicationQueryKeys.lists(),
      });

      setIsDeleteDialogOpen(false);

      void navigate("/applications", {
        replace: true,
      });
    },
  });

  const hasDescription = Boolean(applicationQuery.data?.description?.trim());

  const generation = useGenerateApplicationCvAnalysis({
    applicationId,
    hasDescription,
  });

  function openStatusDialog(): void {
    statusMutation.reset();
    setIsStatusDialogOpen(true);
  }

  function closeStatusDialog(): void {
    if (statusMutation.isPending) {
      return;
    }

    statusMutation.reset();
    setIsStatusDialogOpen(false);
  }

  function handleStatusSubmit(input: UpdateApplicationStatusInput): void {
    statusMutation.mutate(input);
  }

  function openDeleteDialog(): void {
    deleteMutation.reset();
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog(): void {
    if (deleteMutation.isPending) {
      return;
    }

    deleteMutation.reset();
    setIsDeleteDialogOpen(false);
  }

  function confirmDeleteApplication(): void {
    if (deleteMutation.isPending) {
      return;
    }

    deleteMutation.mutate();
  }

  if (!applicationId) {
    return (
      <ApplicationDetailErrorState message="La dirección no contiene un identificador de postulación válido." />
    );
  }

  if (applicationQuery.isPending) {
    return <ApplicationDetailLoadingState />;
  }

  if (applicationQuery.isError) {
    const message = getApplicationErrorMessage(
      applicationQuery.error,
      "No pudimos obtener el detalle de la postulación.",
    );

    return (
      <ApplicationDetailErrorState
        message={message}
        onRetry={() => {
          void applicationQuery.refetch();
        }}
      />
    );
  }

  const application = applicationQuery.data;

  if (!application) {
    return (
      <ApplicationDetailErrorState message="La postulación solicitada no está disponible." />
    );
  }

  const analyses = analysesQuery.data ?? EMPTY_ANALYSES;

  const analysesErrorMessage = analysesQuery.isError
    ? getApplicationErrorMessage(
        analysesQuery.error,
        "No pudimos obtener el historial de análisis.",
      )
    : null;

  const statusErrorMessage = statusMutation.isError
    ? getApplicationErrorMessage(
        statusMutation.error,
        "No pudimos cambiar el estado. Intenta nuevamente.",
      )
    : null;

  const deleteErrorMessage = deleteMutation.isError
    ? getApplicationErrorMessage(
        deleteMutation.error,
        "No pudimos eliminar la postulación. Intenta nuevamente.",
      )
    : null;

  const isStatusPending = statusMutation.isPending;
  const isDeletePending = deleteMutation.isPending;
  const isGenerationPending = generation.isGeneratingAnalysis;

  return (
    <>
      <div className="w-full min-w-0">
        <ApplicationDetailHeader
          application={application}
          isDeleteActionDisabled={
            isStatusPending || isDeletePending || isGenerationPending
          }
          isGenerateActionDisabled={isStatusPending || isDeletePending}
          isGeneratingAnalysis={isGenerationPending}
          isStatusActionDisabled={
            isStatusPending || isDeletePending || isGenerationPending
          }
          onChangeStatus={openStatusDialog}
          onDelete={openDeleteDialog}
          onGenerateAnalysis={
            generation.canGenerateAnalysis
              ? generation.generateAnalysis
              : undefined
          }
        />

        {generation.generationErrorMessage ? (
          <p
            className="mt-4 border-l-2 border-danger pl-3 text-sm leading-6 text-danger"
            role="alert"
          >
            {generation.generationErrorMessage}
          </p>
        ) : generation.availabilityMessage ? (
          <p
            aria-live="polite"
            className="mt-4 border-l-2 border-line-strong pl-3 text-sm leading-6 text-foreground-muted"
          >
            {generation.availabilityMessage}
          </p>
        ) : null}

        <div
          className={[
            "mt-6",
            "grid",
            "gap-6",
            "desktop:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]",
            "desktop:items-start",
          ].join(" ")}
        >
          <div className="min-w-0 space-y-6">
            <ApplicationTimeline events={application.events} />

            {analysesQuery.isPending || analysesQuery.isError ? (
              <AnalysisQueryState
                errorMessage={analysesErrorMessage}
                isError={analysesQuery.isError}
                isPending={analysesQuery.isPending}
                onRetry={() => {
                  void analysesQuery.refetch();
                }}
              />
            ) : (
              <ApplicationAnalysisHistory
                analyses={analyses}
                selectedCvAnalysisId={application.selectedCvAnalysisId}
              />
            )}
          </div>

          <ApplicationDetailsPanel application={application} />
        </div>
      </div>

      {isStatusDialogOpen ? (
        <ChangeApplicationStatusDialog
          currentStatus={application.status}
          errorMessage={statusErrorMessage}
          isSubmitting={isStatusPending}
          onCancel={closeStatusDialog}
          onSubmit={handleStatusSubmit}
        />
      ) : null}

      {isDeleteDialogOpen ? (
        <DeleteApplicationDialog
          application={application}
          errorMessage={deleteErrorMessage}
          isSubmitting={isDeletePending}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDeleteApplication}
        />
      ) : null}
    </>
  );
}
