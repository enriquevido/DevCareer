import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApplicationWithEvents } from "@/domain/application";
import { applicationQueryKeys, fetchApplication } from "@/features/applications";
import {
  cvAnalysisQueryKeys,
  fetchCvAnalysis,
  selectCvAnalysis,
} from "./cv-analysis-api";
import { getCvAnalysisErrorMessage } from "./cv-analysis-error";
import {
  canSelectCvAnalysis,
  shouldPollCvAnalysis,
} from "./cv-analysis-status";

type UseCvAnalysisDetailOptions = {
  analysisId: string | undefined;
};

export function useCvAnalysisDetail({
  analysisId,
}: UseCvAnalysisDetailOptions) {
  const queryClient = useQueryClient();

  const analysisQuery = useQuery({
    queryKey: cvAnalysisQueryKeys.detail(analysisId ?? "missing"),
    queryFn: () => {
      if (!analysisId) {
        throw new Error("A CV analysis id is required.");
      }

      return fetchCvAnalysis(analysisId);
    },
    enabled: Boolean(analysisId),
    refetchInterval: (query) => {
      const analysis = query.state.data;

      if (!analysis) {
        return false;
      }

      return shouldPollCvAnalysis(analysis.status) ? 2_500 : false;
    },
    refetchIntervalInBackground: false,
  });

  const analysis = analysisQuery.data ?? null;

  const applicationId = analysis?.applicationId;

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

  const application = applicationQuery.data ?? null;

  const selectMutation = useMutation({
    mutationFn: () => {
      if (!analysis) {
        throw new Error("A CV analysis is required.");
      }

      return selectCvAnalysis(analysis.applicationId, analysis.id);
    },
    onSuccess: (selection) => {
      queryClient.setQueryData<ApplicationWithEvents>(
        applicationQueryKeys.detail(selection.id),
        (currentApplication) => {
          if (!currentApplication) {
            return currentApplication;
          }

          return {
            ...currentApplication,
            selectedCvAnalysisId: selection.selectedCvAnalysisId,
            updatedAt: selection.updatedAt,
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: applicationQueryKeys.lists(),
      });
    },
  });

  const isSelected = Boolean(
    analysis && application?.selectedCvAnalysisId === analysis.id,
  );

  const canSelect = Boolean(
    analysis && !isSelected && canSelectCvAnalysis(analysis),
  );

  const isPending =
    analysisQuery.isPending || Boolean(analysis && applicationQuery.isPending);

  const detailErrorMessage = analysisQuery.isError
    ? getCvAnalysisErrorMessage(
        analysisQuery.error,
        "No pudimos obtener el análisis solicitado.",
      )
    : applicationQuery.isError
      ? getCvAnalysisErrorMessage(
          applicationQuery.error,
          "No pudimos obtener la vacante relacionada.",
        )
      : null;

  const selectionErrorMessage = selectMutation.isError
    ? getCvAnalysisErrorMessage(
        selectMutation.error,
        "No pudimos seleccionar este CV. Revisa que el PDF siga disponible e intenta nuevamente.",
      )
    : null;

  function retry(): void {
    if (analysisQuery.isError) {
      void analysisQuery.refetch();
    }

    if (applicationQuery.isError) {
      void applicationQuery.refetch();
    }
  }

  function resetSelection(): void {
    if (selectMutation.isPending) {
      return;
    }

    selectMutation.reset();
  }

  async function selectAnalysis(): Promise<boolean> {
    if (!canSelect || selectMutation.isPending) {
      return false;
    }

    try {
      await selectMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }

  return {
    analysis,
    application,
    detailErrorMessage,
    isPending,
    isSelected,
    isSelecting: selectMutation.isPending,
    resetSelection,
    retry,
    selectAnalysis,
    selectionErrorMessage,
  };
}
