import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { RoutePlaceholder } from "./pages/route-placeholder";

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
        element: (
          <RoutePlaceholder
            eyebrow="Seguimiento"
            title="Postulaciones"
            description="Busca, filtra y consulta las vacantes que forman parte de tu proceso."
            path="/applications"
          />
        ),
      },
      {
        path: "applications/new",
        element: (
          <RoutePlaceholder
            eyebrow="Postulaciones"
            title="Nueva postulación"
            description="Registra la vacante y su descripción antes de analizar el CV."
            path="/applications/new"
          />
        ),
      },
      {
        path: "applications/:applicationId",
        element: (
          <RoutePlaceholder
            eyebrow="Postulaciones"
            title="Detalle de postulación"
            description="Consulta la vacante, su línea de tiempo y las versiones de CV relacionadas."
            path="/applications/:applicationId"
          />
        ),
      },
      {
        path: "applications/:applicationId/edit",
        element: (
          <RoutePlaceholder
            eyebrow="Postulaciones"
            title="Editar postulación"
            description="Actualiza los datos de la vacante sin perder su historial."
            path="/applications/:applicationId/edit"
          />
        ),
      },
      {
        path: "resume",
        element: (
          <RoutePlaceholder
            eyebrow="Documento fuente"
            title="CV maestro"
            description="Carga y consulta la versión LaTeX utilizada para producir documentos derivados."
            path="/resume"
          />
        ),
      },
      {
        path: "cv-analyses/:analysisId",
        element: (
          <RoutePlaceholder
            eyebrow="Revisión de CV"
            title="Análisis del CV"
            description="Revisa recomendaciones, cambios aplicados, brechas y resultados de compilación."
            path="/cv-analyses/:analysisId"
          />
        ),
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
