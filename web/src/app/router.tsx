import { Navigate, createBrowserRouter } from "react-router-dom";
import { ApplicationDetailPage } from "@/pages/applications/application-detail-page";
import { ApplicationsPage } from "@/pages/applications/applications-page";
import { EditApplicationPage } from "@/pages/applications/edit-application-page";
import { NewApplicationPage } from "@/pages/applications/new-application-page";
import { CvAnalysisDetailPage } from "@/pages/cv-analyses/cv-analysis-detail-page";
import { ResumePage } from "@/pages/resume/resume-page";
import { RoutePlaceholder } from "@/pages/route-placeholder";
import { AppShell } from "./layout/app-shell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/applications" />,
      },
      {
        path: "applications",
        element: <ApplicationsPage />,
      },
      {
        path: "applications/new",
        element: <NewApplicationPage />,
      },
      {
        path: "applications/:applicationId",
        element: <ApplicationDetailPage />,
      },
      {
        path: "applications/:applicationId/edit",
        element: <EditApplicationPage />,
      },
      {
        path: "resume",
        element: <ResumePage />,
      },
      {
        path: "cv-analyses/:analysisId",
        element: <CvAnalysisDetailPage />,
      },
      {
        path: "*",
        element: (
          <RoutePlaceholder
            eyebrow="Navegación"
            title="Página no encontrada"
            description="La dirección solicitada no corresponde con una sección disponible."
            path="*"
          />
        ),
      },
    ],
  },
]);
