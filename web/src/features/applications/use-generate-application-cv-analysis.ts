import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { CvAnalysisSummary } from "@/domain/cv-analysis";
import { fetchCurrentResume, resumeQueryKeys } from "../resume/resume-api";
import {
  cvAnalysisQueryKeys,
  generateApplicationCvAnalysis,
} from "./cv-analysis-api";
import { getCvAnalysisErrorMessage } from "./cv-analysis-error";

type UseGenerateApplicationCvAnalysisOptions = {
  applicationId: string | undefined;
  hasDescription: boolean;
};

export function useGenerateApplicationCvAnalysis({
  applicationId,
  hasDescription,
}: UseGenerateApplicationCvAnalysisOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const resumeQuery = useQuery({
    queryKey: resumeQueryKeys.current(),
    queryFn: fetchCurrentResume,
    enabled: Boolean(applicationId && hasDescription),
  });

  const generateMutation = useMutation({
    mutationFn: () => {
      const currentResume = resumeQuery.data;

      if (!applicationId) {
        throw new Error("An application id is required.");
      }

      if (!currentResume) {
        throw new Error("A resume version is required.");
      }

      return generateApplicationCvAnalysis(applicationId, {
        resumeVersionId: currentResume.id,
      });
    },
    onSuccess: (analysis) => {
      if (!applicationId) {
        return;
      }

      queryClient.setQueryData<CvAnalysisSummary[]>(
        cvAnalysisQueryKeys.listByApplication(applicationId),
        (currentAnalyses) => {
          if (!currentAnalyses) {
            return [analysis];
          }

          return [
            analysis,
            ...currentAnalyses.filter(
              (currentAnalysis) => currentAnalysis.id !== analysis.id,
            ),
          ];
        },
      );

      void navigate(`/cv-analyses/${analysis.id}`);
    },
  });

  const currentResume = resumeQuery.data ?? null;

  const canGenerateAnalysis = Boolean(
    applicationId && hasDescription && currentResume && !resumeQuery.isError,
  );

  let availabilityMessage: string | null = null;

  if (!hasDescription) {
    availabilityMessage =
      "Añade la descripción de la vacante antes de generar un análisis.";
  } else if (resumeQuery.isError) {
    availabilityMessage = getCvAnalysisErrorMessage(
      resumeQuery.error,
      "No pudimos consultar el CV maestro.",
    );
  } else if (!resumeQuery.isPending && !currentResume) {
    availabilityMessage = "Carga un CV maestro antes de generar un análisis.";
  }

  const generationErrorMessage = generateMutation.isError
    ? getCvAnalysisErrorMessage(
        generateMutation.error,
        "No pudimos generar el análisis. Intenta nuevamente.",
      )
    : null;

  function generateAnalysis(): void {
    if (!canGenerateAnalysis || generateMutation.isPending) {
      return;
    }

    generateMutation.mutate();
  }

  return {
    availabilityMessage,
    canGenerateAnalysis,
    generateAnalysis,
    generationErrorMessage,
    isGeneratingAnalysis: generateMutation.isPending,
    isResumePending: resumeQuery.isPending,
  };
}
