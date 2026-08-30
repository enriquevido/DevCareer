import { useParams } from "react-router-dom";
import { CvAnalysisDetailHeader } from "./cv-analysis-detail-header";
import {
  CvAnalysisDetailErrorState,
  CvAnalysisDetailLoadingState,
} from "./cv-analysis-detail-page-state";
import { CvAnalysisWorkspace } from "./cv-analysis-workspace";
import { useCvAnalysisDetail } from "./use-cv-analysis-detail";

export function CvAnalysisDetailPage() {
  const { analysisId } = useParams<{
    analysisId: string;
  }>();

  const {
    analysis,
    application,
    detailErrorMessage,
    isPending,
    isSelected,
    isSelecting,
    retry,
    selectAnalysis,
    selectionErrorMessage,
  } = useCvAnalysisDetail({
    analysisId,
  });

  if (!analysisId) {
    return (
      <CvAnalysisDetailErrorState message="La dirección no contiene un identificador de análisis válido." />
    );
  }

  if (isPending) {
    return <CvAnalysisDetailLoadingState />;
  }

  if (detailErrorMessage) {
    return (
      <CvAnalysisDetailErrorState
        message={detailErrorMessage}
        onRetry={retry}
      />
    );
  }

  if (!analysis || !application) {
    return (
      <CvAnalysisDetailErrorState message="El análisis o su postulación relacionada no están disponibles." />
    );
  }

  return (
    <div className="w-full min-w-0">
      <CvAnalysisDetailHeader
        analysis={analysis}
        isSelected={isSelected}
        isSelecting={isSelecting}
        onSelect={selectAnalysis}
      />

      {selectionErrorMessage ? (
        <p
          className={[
            "mt-4",
            "border-l-2",
            "border-danger",
            "pl-3",
            "text-sm",
            "leading-6",
            "text-danger",
          ].join(" ")}
          role="alert"
        >
          {selectionErrorMessage}
        </p>
      ) : null}

      <CvAnalysisWorkspace analysis={analysis} application={application} />
    </div>
  );
}
