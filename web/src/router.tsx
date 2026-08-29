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
            sequence="01"
            eyebrow="Registro principal"
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
            sequence="01.1"
            eyebrow="Nuevo expediente"
            title="Registrar postulación"
            description="Captura la vacante completa antes de analizar y adaptar el CV."
            path="/applications/new"
          />
        ),
      },
      {
        path: "applications/:applicationId",
        element: (
          <RoutePlaceholder
            sequence="01.2"
            eyebrow="Detalle del expediente"
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
            sequence="01.3"
            eyebrow="Corrección del registro"
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
            sequence="02"
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
            sequence="03"
            eyebrow="Mesa de revisión"
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
            sequence="404"
            eyebrow="Expediente inexistente"
            title="Página no encontrada"
            description="La dirección solicitada no corresponde con una sección registrada."
            path="*"
          />
        ),
      },
    ],
  },
]);
