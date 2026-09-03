import { useState } from "react";
import { useParams } from "react-router-dom";
import { ConfirmCvSelectionDialog } from "./confirm-cv-selection-dialog";
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

  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);

  const {
    analysis,
    application,
    detailErrorMessage,
    isPending,
    isSelected,
    isSelecting,
    resetSelection,
    retry,
    selectAnalysis,
    selectionErrorMessage,
  } = useCvAnalysisDetail({
    analysisId,
  });

  function openSelectionDialog(): void {
    resetSelection();
    setIsSelectionDialogOpen(true);
  }

  function closeSelectionDialog(): void {
    if (isSelecting) {
      return;
    }

    resetSelection();
    setIsSelectionDialogOpen(false);
  }

  function confirmSelection(): void {
    void selectAnalysis().then((selectionSucceeded) => {
      if (selectionSucceeded) {
        setIsSelectionDialogOpen(false);
      }
    });
  }

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
    <>
      <div className="w-full min-w-0">
        <CvAnalysisDetailHeader
          analysis={analysis}
          isSelected={isSelected}
          isSelecting={isSelecting}
          onSelect={openSelectionDialog}
        />

        <CvAnalysisWorkspace analysis={analysis} application={application} />
      </div>

      {isSelectionDialogOpen ? (
        <ConfirmCvSelectionDialog
          analysis={analysis}
          errorMessage={selectionErrorMessage}
          hasExistingSelection={application.selectedCvAnalysisId !== null}
          isSubmitting={isSelecting}
          onCancel={closeSelectionDialog}
          onConfirm={confirmSelection}
        />
      ) : null}
    </>
  );
}
