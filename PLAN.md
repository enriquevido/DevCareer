# Job Search Tracker - Plan del proyecto

> Documento de contexto y referencia unica para el desarrollo guiado.
> El objetivo es que cada cambio se implemente manualmente, un hito a la vez,
> entendiendo antes de avanzar el motivo de cada archivo, tipo y flujo de datos.

## 1. Vision del producto

El proyecto es una herramienta local para adaptar de forma honesta un CV escrito en LaTeX a cada
vacante y, despues, dar seguimiento a la postulacion.

El usuario mantiene un CV maestro en un unico archivo `.tex`. Para cada vacante, la aplicacion
compara la descripcion del puesto con ese CV y usa IA para proponer ajustes de redaccion y palabras
clave. Las sugerencias deben mejorar la correspondencia con la vacante sin inventar experiencia,
tecnologias, estudios, responsabilidades, logros ni metricas.

La IA no modifica el CV maestro. Cada analisis genera una version derivada y auditable del `.tex`,
que puede compilarse en un servicio Docker para obtener un PDF. El usuario revisa esa version y
decide explicitamente si sera el CV asociado a la postulacion.

El seguimiento de postulaciones se conserva como parte del mismo flujo: vacante, CV utilizado,
estado actual e historial de eventos permanecen relacionados.

## 2. Problema a resolver

- Adaptar manualmente el CV a cada vacante requiere releer y comparar mucho texto.
- Es facil omitir palabras clave relevantes que ya estan respaldadas por la experiencia real.
- Una IA generica puede exagerar o inventar informacion si no tiene restricciones claras.
- No existe trazabilidad entre la vacante, las recomendaciones recibidas y la version exacta del CV.
- La informacion de las postulaciones queda dispersa entre portales, archivos y notas.
- Sin historial, es dificil recordar que CV se envio y que ocurrio despues de postularse.

## 3. Objetivo del MVP

Construir una aplicacion local que permita:

1. Cargar y versionar un CV maestro `.tex` autocontenido.
2. Registrar una vacante y su descripcion completa.
3. Comparar el CV con la vacante mediante DeepSeek.
4. Obtener sugerencias estructuradas y verificables.
5. Generar un `.tex` derivado sin modificar el original.
6. Compilar la version derivada a PDF dentro de Docker.
7. Revisar y descargar el `.tex`, el PDF y el detalle de los cambios.
8. Seleccionar explicitamente una version como el CV utilizado en la postulacion.
9. Conservar el seguimiento de estados y eventos de cada postulacion.

## 4. Principios del producto

### 4.1 Honestidad antes que coincidencia

- La IA solo puede reformular informacion presente en el CV maestro.
- No puede agregar habilidades, herramientas, cargos, responsabilidades, fechas o resultados que no
  aparezcan en la fuente.
- No puede fabricar cifras ni convertir una actividad academica en experiencia profesional.
- Las carencias reales se muestran como brechas; no se corrigen inventando contenido.
- Toda recomendacion debe incluir el fragmento original, el reemplazo y una justificacion.

### 4.2 El CV maestro es inmutable

- Cada carga crea una nueva `ResumeVersion`.
- Un analisis siempre referencia la version exacta que utilizo.
- La fuente original nunca se sobrescribe durante un analisis.
- La version derivada se almacena por separado y puede reproducirse o descargarse.

### 4.3 La IA propone; el usuario decide

- Un resultado generado no se convierte automaticamente en el CV de la postulacion.
- El usuario revisa el diff y los avisos antes de seleccionarlo.
- La aplicacion conserva el modelo utilizado, la fecha y las recomendaciones del analisis.
- La aplicacion no presenta una sugerencia como verdadera solo porque proviene de la IA.

### 4.4 Aplicacion determinista de cambios

- DeepSeek devuelve reemplazos estructurados, no un documento LaTeX completo reescrito libremente.
- El backend busca cada fragmento original dentro de la fuente.
- Un reemplazo solo se aplica si el fragmento existe exactamente una vez.
- Los reemplazos duplicados, ausentes, identicos o solapados se rechazan y se reportan.
- Los cambios validos se aplican sobre una copia para producir el `.tex` derivado.

## 5. Fuera del alcance inicial

- Proyectos LaTeX con multiples archivos, imagenes, clases o paquetes locales.
- Edicion visual completa del CV dentro del navegador.
- Aplicacion automatica de cambios sobre el CV maestro.
- Invencion o inferencia de experiencia no documentada.
- Cartas de presentacion y preguntas de entrevista generadas por IA.
- Autenticacion multiusuario.
- Almacenamiento en AWS S3, Backblaze B2, Cloudflare R2 u otra nube.
- Envio automatico de postulaciones.
- Scraping automatico de LinkedIn u otros portales.

## 6. Stack tecnico

| Capa | Tecnologia |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL local mediante Docker |
| IA | DeepSeek mediante el SDK compatible con OpenAI |
| Modelo predeterminado | `deepseek-v4-flash`, configurable por entorno |
| Salida de IA | JSON estructurado y validado por el backend |
| Compilacion | Servicio Docker aislado con LaTeX |
| Archivos | Almacenamiento local para PDF; fuente `.tex` en PostgreSQL |
| Estilos | Tailwind CSS y componentes pequenos propios |
| Datos web | TanStack Query |
| Navegacion | React Router |

## 7. Flujo principal

### UC-1 - Cargar el CV maestro

1. El usuario selecciona un archivo `.tex`.
2. La API valida extension, tamano, codificacion UTF-8 y contenido no vacio.
3. La API calcula un hash SHA-256.
4. Si el contenido ya existe, puede reutilizarse la version existente.
5. Si es nuevo, se crea una `ResumeVersion` inmutable.
6. La version mas reciente se considera el CV maestro actual.

Limites iniciales:

- Un solo archivo `.tex` autocontenido.
- Tamano maximo: 512 KiB.
- No se aceptan archivos binarios ni ZIP en el MVP.

### UC-2 - Registrar una vacante

La vacante conserva:

- Empresa.
- Titulo del puesto.
- URL de la oferta.
- Descripcion completa.
- Ubicacion y modalidad remota.
- Rango salarial, si existe.
- Fuente de la vacante.
- Notas privadas.
- Estado actual.

La descripcion es obligatoria para solicitar un analisis del CV, aunque puede ser opcional al crear
un borrador de postulacion.

### UC-3 - Analizar el CV contra una vacante

1. El usuario abre el detalle de una vacante.
2. Selecciona una version del CV o utiliza la actual.
3. La API crea un `CvAnalysis` con estado `PROCESSING`.
4. La API envia a DeepSeek la descripcion y la fuente LaTeX completa.
5. DeepSeek devuelve JSON con resumen, palabras clave, brechas y reemplazos.
6. La API valida la estructura y cada reemplazo.
7. Los reemplazos validos se aplican deterministamente sobre una copia.
8. Se guarda el `.tex` derivado junto con las recomendaciones aceptadas y rechazadas.
9. Se solicita su compilacion al servicio LaTeX.
10. El analisis termina como `READY`, `COMPILE_FAILED` o `AI_FAILED`.

### UC-4 - Revisar el resultado

La vista del analisis debe mostrar:

- Resumen general en espanol.
- Palabras clave ya presentes.
- Palabras clave relevantes que faltan, mostradas como brechas y no como contenido para inventar.
- Fragmento original y reemplazo propuesto.
- Seccion del CV afectada.
- Justificacion en espanol.
- Palabras clave relacionadas.
- Estado de cada reemplazo y motivo de rechazo, si aplica.
- Diff entre la fuente original y la derivada.
- Diagnostico de compilacion cuando exista un error.
- Descarga del `.tex` derivado y del PDF compilado.

Los fragmentos propuestos conservan el idioma del CV. Las explicaciones de la IA se generan en
espanol.

### UC-5 - Seleccionar el CV de la postulacion

- Solo un analisis perteneciente a la misma postulacion puede seleccionarse.
- El usuario debe confirmar la seleccion explicitamente.
- Para seleccionar una version generada, el analisis debe tener un PDF compilado valido.
- Tambien puede adjuntarse manualmente un PDF compilado fuera de la aplicacion.
- La postulacion conserva la referencia exacta al analisis o PDF que se utilizo.

### UC-6 - Dar seguimiento a la postulacion

La aplicacion mantiene un historial de estados:

```text
DRAFT -> APPLIED -> RESPONSE_RECEIVED -> INTERVIEW -> OFFER -> CLOSED
                                           -> REJECTED -> CLOSED
```

Cada cambio crea un `TimelineEvent` con fecha y nota opcional. Los eventos anteriores nunca se
eliminan al cambiar el estado actual.

### UC-7 - Gestionar postulaciones

- Listar todas las postulaciones.
- Buscar por empresa o titulo.
- Filtrar por estado.
- Crear y editar borradores.
- Consultar el detalle y la linea de tiempo.
- Consultar todos los analisis generados para una vacante.
- Cerrar o eliminar una postulacion.

## 8. Contrato de salida de la IA

DeepSeek debe devolver un objeto JSON equivalente a la siguiente estructura conceptual:

```ts
type AiAnalysisResult = {
  summaryEs: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  warningsEs: string[];
  recommendations: Array<{
    section: string;
    originalText: string;
    replacementText: string;
    rationaleEs: string;
    matchedKeywords: string[];
  }>;
};
```

Reglas de validacion:

- Todas las propiedades requeridas deben existir y tener el tipo esperado.
- `originalText` y `replacementText` no pueden estar vacios ni ser iguales.
- `originalText` debe aparecer exactamente una vez en la fuente.
- Dos recomendaciones no pueden modificar rangos solapados.
- Una recomendacion invalida se conserva para auditoria, pero no se aplica.
- Una respuesta vacia, truncada o con JSON invalido produce `AI_FAILED`.
- Si ninguna recomendacion es valida, la fuente derivada debe ser identica al CV maestro.

## 9. Modelo de datos objetivo

### Application

Representa la vacante y su seguimiento. Conserva los campos actuales de empresa, puesto,
descripcion, ubicacion, modalidad, salario, fuente, notas, estado y fechas.

Relaciones nuevas:

- Muchos `CvAnalysis`.
- Un `selectedCvAnalysis` opcional.
- Un PDF manual opcional para conservar compatibilidad con compilaciones externas.

### ResumeVersion

```prisma
model ResumeVersion {
  id           String       @id @default(cuid())
  originalName String
  source       String
  sha256       String       @unique
  createdAt    DateTime     @default(now())
  analyses     CvAnalysis[]
}
```

Cada registro es inmutable. Una nueva carga no actualiza una fila existente.

### CvAnalysis

Campos conceptuales:

- `applicationId`: vacante analizada.
- `resumeVersionId`: CV maestro utilizado.
- `status`: estado del proceso.
- `model`: identificador real del modelo solicitado.
- `summaryEs`: resumen legible.
- `recommendations`: JSON validado, incluyendo cambios rechazados.
- `derivedSource`: fuente resultante.
- `compiledPdfFile`: nombre interno del PDF, si la compilacion fue exitosa.
- `errorMessage`: diagnostico sanitizado para fallos.
- Fechas de creacion y actualizacion.

Estados previstos:

```prisma
enum CvAnalysisStatus {
  PROCESSING
  READY
  AI_FAILED
  COMPILE_FAILED
}
```

### TimelineEvent

Se conserva el modelo actual: pertenece a una postulacion, registra estado, nota y fecha.

### AiSuggestion

El modelo actual se elimina porque guarda texto libre y no puede representar una adaptacion
auditable. No hay datos reales que preservar en esta etapa.

## 10. API objetivo

### CV maestro

- `POST /api/resumes`
  - Multipart con el campo `file`.
  - Crea o reutiliza una version por hash.
- `GET /api/resumes/current`
  - Devuelve metadatos de la version mas reciente.
- `GET /api/resumes/:id/source`
  - Descarga el `.tex` original.

### Analisis por vacante

- `POST /api/applications/:id/cv-analyses`
  - Cuerpo opcional: `{ "resumeVersionId": "..." }`.
  - Usa la version actual cuando no se especifica una.
- `GET /api/applications/:id/cv-analyses`
  - Lista el historial de analisis de esa vacante.
- `GET /api/cv-analyses/:id`
  - Devuelve recomendaciones, estados y diagnosticos.
- `GET /api/cv-analyses/:id/source`
  - Descarga el `.tex` derivado.
- `GET /api/cv-analyses/:id/pdf`
  - Sirve el PDF compilado.
- `POST /api/applications/:id/cv-analyses/:analysisId/select`
  - Selecciona explicitamente el CV definitivo.

### PDF manual

- `PUT /api/applications/:id/cv`
  - Adjunta o reemplaza un PDF compilado externamente.
- `GET /api/applications/:id/cv`
  - Muestra o descarga el PDF asociado.

El endpoint generico `POST /api/files/upload` se retirara cuando los endpoints asociados a una
postulacion esten implementados. Esto evita archivos huerfanos y nombres asignados por el cliente.

### Postulaciones

Se conservan los endpoints CRUD, busqueda, filtros y cambio de estado existentes. Sus respuestas se
ajustaran para incluir metadatos del CV seleccionado sin devolver fuentes LaTeX completas en los
listados.

## 11. Servicio de compilacion LaTeX

La compilacion se ejecuta en un contenedor separado de la API.

Responsabilidades:

- Recibir una fuente `.tex` mediante HTTP interno.
- Crear un directorio temporal por solicitud.
- Ejecutar LaTeX con `-no-shell-escape`, `-halt-on-error` y `-interaction=nonstopmode`.
- Aplicar limite de cuerpo y timeout de proceso.
- Ejecutarse con un usuario sin privilegios.
- Devolver el PDF como binario cuando la compilacion sea correcta.
- Devolver un diagnostico limitado y sanitizado cuando falle.
- Eliminar los archivos temporales al terminar.

El servicio se expondra solo en `127.0.0.1` y no sera una API publica. La API NestJS sera la unica
responsable de almacenar el PDF recibido y relacionarlo con un analisis.

Aunque falle la compilacion, el analisis y su `.tex` derivado deben conservarse para que el usuario
pueda corregir o compilar el documento fuera de la aplicacion.

## 12. Interfaz web

### Paginas

1. **CV maestro**
   - Carga de `.tex`.
   - Nombre, hash corto y fecha de la version actual.
   - Historial de versiones y descarga.

2. **Postulaciones**
   - Tabla compacta con empresa, puesto, estado, CV seleccionado y fecha.
   - Busqueda por empresa o puesto.
   - Filtro por estado.

3. **Nueva / editar postulacion**
   - Formulario completo de la vacante.
   - Descripcion amplia y validacion clara.

4. **Detalle de postulacion**
   - Datos de la vacante.
   - Estado y linea de tiempo.
   - CV seleccionado.
   - Historial de analisis.
   - Accion para generar un nuevo analisis.

5. **Detalle de analisis**
   - Resumen y brechas.
   - Comparacion antes/despues por recomendacion.
   - Estado de validacion de cada cambio.
   - Diff completo.
   - Descarga de `.tex` y PDF.
   - Diagnostico de compilacion.
   - Accion explicita para seleccionar la version.

### Lineamientos visuales

- Interfaz de trabajo sobria, compacta y responsive.
- Fondo neutro, bordes finos y un solo color de acento principal.
- Colores semanticos para estados, errores y advertencias.
- Sin landing page ni contenido promocional.
- Sin tarjetas anidadas ni decoracion sin funcion.
- Controles con etiquetas, foco visible y estados de carga accesibles.
- Texto suficientemente pequeno para una herramienta operativa, sin titulares gigantes.

## 13. Seguridad y limites

- Nunca exponer `DEEPSEEK_API_KEY` al frontend.
- No registrar la clave, el CV completo ni respuestas completas de IA en logs de produccion.
- Validar DTOs con `whitelist` y rechazar propiedades desconocidas cuando corresponda.
- No aceptar rutas o nombres de archivos como ubicaciones directas del sistema.
- Generar nombres internos aleatorios para PDFs.
- Comprobar que cada recurso solicitado pertenece a la postulacion indicada.
- Deshabilitar `shell-escape` durante la compilacion.
- Limitar tamano, tiempo y salida del compilador.
- No servir diagnosticos con rutas internas completas.
- Mantener la aplicacion local y sin autenticacion solo mientras sea de un unico usuario.

## 14. Estado actual evaluado

### Completado

- Scaffold de NestJS, React, TypeScript y Vite.
- PostgreSQL mediante Docker Compose.
- Prisma y migracion inicial.
- CRUD base de postulaciones.
- Busqueda y filtro por estado.
- Historial transaccional de cambios de estado.
- Seed con datos de ejemplo.
- Carga y servicio basico de PDF.
- Proteccion basica contra path traversal al descargar archivos.
- Cliente de DeepSeek y persistencia inicial de sugerencias.

### Parcial o pendiente de corregir

- La IA actual no recibe el CV; por ello no realiza una comparacion real.
- `resume_match` promete un analisis que el flujo actual no puede producir.
- Las sugerencias se guardan como texto libre sin validacion estructural.
- La carga de PDF no esta ligada transaccionalmente a una postulacion.
- Los nombres de archivos pueden llegar al DTO de postulacion desde el cliente.
- No existe versionado del CV maestro.
- No existe generacion de `.tex` derivado ni diff.
- No existe compilacion LaTeX.
- Los errores externos de DeepSeek no tienen estados persistentes ni diagnostico controlado.
- Las pruebas solo cubren el `Hello World` generado por NestJS.
- El test e2e no reproduce actualmente el prefijo global `/api`.
- Los README siguen siendo las plantillas de NestJS y Vite.
- El frontend solo muestra el titulo `Job Search Tracker`.
- Las dependencias del frontend no estan instaladas en el entorno actual.

### Fase real

El proyecto se encuentra al final de una **Fase 1 parcial de backend**, pero esa fase no debe
considerarse cerrada. Antes de construir el frontend es necesario corregir el dominio del CV y el
contrato de IA. Construir la interfaz sobre `AiSuggestion` y `cvFile` actuales produciria trabajo
que tendria que rehacerse.

## 15. Roadmap actualizado

### Hito 1 - Alinear contrato y modelo de datos

- Actualizar este documento como nueva fuente de verdad.
- Anadir `ResumeVersion`, `CvAnalysis` y `CvAnalysisStatus` a Prisma.
- Relacionar analisis y CV seleccionado con `Application`.
- Retirar `AiSuggestion`.
- Crear una migracion y adaptar el seed.
- Anadir pruebas del modelo y regresion de postulaciones.

Criterio de salida: Prisma genera el cliente, la migracion se aplica desde cero, el seed funciona y
los endpoints actuales de postulaciones continúan compilando.

### Hito 2 - CV maestro

- Crear el modulo `resumes`.
- Implementar carga, hash, versionado y descarga.
- Validar archivo, UTF-8, tamano y contenido.
- Probar duplicados y entradas invalidas.

Criterio de salida: se puede cargar un `.tex`, consultar la version actual y descargar exactamente
la misma fuente.

### Hito 3 - Analisis estructurado y version derivada

- Sustituir el modulo de IA generica por `cv-analyses`.
- Definir el prompt con restricciones de honestidad.
- Solicitar y validar JSON.
- Implementar el motor determinista de reemplazos.
- Persistir estados, recomendaciones y fuente derivada.
- Probar errores, duplicados, solapamientos y respuestas invalidas.

Criterio de salida: una vacante y un CV producen un analisis auditable y un `.tex` derivado sin
modificar la fuente.

### Hito 4 - Compilacion Docker

- Crear el servicio LaTeX aislado.
- Integrarlo en Docker Compose.
- Crear el cliente interno en NestJS.
- Almacenar PDF o diagnostico de error.
- Implementar descargas y seleccion de version.

Criterio de salida: un `.tex` valido produce PDF y uno invalido conserva su fuente con estado
`COMPILE_FAILED`.

### Hito 5 - Frontend funcional

- Configurar Router y Query Client.
- Crear cliente HTTP y tipos.
- Implementar CV maestro, listado, formularios, detalle y analisis.
- Mostrar diff, estados, errores y descargas.
- Verificar vistas de escritorio y movil.

Criterio de salida: el flujo completo puede realizarse desde el navegador sin llamadas manuales a
la API.

### Hito 6 - Calidad y documentacion

- Completar pruebas unitarias, integracion y e2e.
- Anadir estados vacios, carga, errores y confirmaciones.
- Reemplazar README de plantilla por instrucciones reales.
- Crear `.env.example` sin secretos.
- Documentar instalacion, migraciones, Docker, DeepSeek y compilacion.

Criterio de salida: una instalacion limpia puede ejecutar, probar y comprender el proyecto siguiendo
solo el README.

## 16. Estrategia de commits por hito

Cada commit debe representar una sola responsabilidad significativa. El proyecto debe compilar o,
cuando el commit solo afecte documentacion, conservar el mismo comportamiento anterior. No se deben
mezclar cambios de dominio, infraestructura, interfaz, pruebas y documentacion en un mismo commit
cuando puedan revisarse de manera independiente.

Los titulos propuestos siguen Conventional Commits. Pueden ajustarse si durante el desarrollo cambia
el alcance real, pero nunca deben describir trabajo que el commit no contiene.

### Commits del Hito 1 - Alinear contrato y modelo de datos

1. `docs(plan): redefine project around honest LaTeX CV tailoring`
   - Versionar este documento con la nueva vision, limites, arquitectura y roadmap.
   - No incluye cambios ejecutables.

2. `refactor(ai): remove legacy free-form suggestion feature`
   - Retirar el modulo `ai` actual y su registro en `AppModule`.
   - Eliminar el uso de la relacion `suggestions` en el servicio de postulaciones.
   - Retirar `AiSuggestion` del esquema, la migracion correspondiente y los datos del seed.
   - Dejar el backend compilando antes de introducir el nuevo dominio.

3. `feat(db): add versioned resumes and CV analyses`
   - Anadir `ResumeVersion`, `CvAnalysis` y `CvAnalysisStatus`.
   - Crear las relaciones con `Application` y la seleccion opcional del analisis utilizado.
   - Crear la migracion Prisma sin implementar aun endpoints o logica de IA.

4. `chore(seed): seed the CV tailoring domain`
   - Adaptar el orden de limpieza a las nuevas llaves foraneas.
   - Crear una version de CV LaTeX de ejemplo.
   - Crear postulaciones y analisis coherentes con los nuevos estados.

5. `test(api): cover application persistence regressions`
   - Cubrir creacion de postulacion y evento inicial dentro de una transaccion.
   - Cubrir busqueda, filtros, detalle y cambio de estado.
   - Verificar que retirar `AiSuggestion` no rompa el comportamiento existente.

### Commits del Hito 2 - CV maestro

1. `feat(resumes): validate LaTeX resume uploads`
   - Crear constantes y validaciones para nombre, extension, tamano, UTF-8 y contenido.
   - Mantener estas reglas separadas del transporte HTTP y de Prisma.

2. `feat(resumes): persist immutable resume versions`
   - Crear el servicio de dominio.
   - Calcular SHA-256, reutilizar duplicados y consultar la version actual.
   - Impedir actualizaciones destructivas de versiones existentes.

3. `feat(resumes): expose upload and download endpoints`
   - Crear modulo y controlador.
   - Implementar carga multipart, consulta de la version actual y descarga de `.tex`.
   - Registrar el modulo en `AppModule`.

4. `test(resumes): cover upload validation and versioning`
   - Probar archivos validos, vacios, binarios, demasiado grandes y con extension incorrecta.
   - Probar deduplicacion por hash y descarga exacta de la fuente.

### Commits del Hito 3 - Analisis estructurado y version derivada

1. `feat(cv-analysis): define structured AI response contract`
   - Crear tipos, DTOs y validacion de la respuesta JSON.
   - Definir el prompt de honestidad y la salida esperada.
   - Mantener la llamada a DeepSeek detras de un servicio reemplazable en pruebas.

2. `feat(cv-analysis): apply deterministic LaTeX replacements`
   - Implementar el motor puro de reemplazos.
   - Detectar fragmentos ausentes, repetidos, identicos y solapados.
   - Producir fuente derivada y resultados de validacion sin acceder a red o base de datos.

3. `feat(cv-analysis): persist analysis lifecycle`
   - Crear analisis en `PROCESSING`.
   - Resolver vacante y version del CV.
   - Persistir recomendaciones, fuente derivada y estados `READY` o `AI_FAILED`.

4. `feat(cv-analysis): expose generation and query endpoints`
   - Crear modulo y controladores para generar, listar, consultar y descargar la fuente derivada.
   - Aplicar validacion y respuestas HTTP consistentes.

5. `test(cv-analysis): cover AI failures and replacement rules`
   - Probar JSON valido, invalido, vacio y truncado.
   - Probar todas las reglas del motor de reemplazos y las transiciones de estado.

### Commits del Hito 4 - Compilacion Docker

1. `feat(latex): add isolated compilation service`
   - Crear la imagen y el servidor interno de compilacion.
   - Aplicar usuario sin privilegios, limites, timeout y `-no-shell-escape`.

2. `chore(docker): register the LaTeX compilation service`
   - Integrar el servicio en Docker Compose.
   - Definir red, puerto local, healthcheck y variables de entorno necesarias.

3. `feat(latex): integrate the compilation client`
   - Crear el cliente NestJS para enviar una fuente y recibir PDF o diagnostico.
   - Diferenciar fallos de transporte, timeout y errores de compilacion.

4. `feat(cv-analysis): compile and store derived resumes`
   - Incorporar la compilacion al ciclo de analisis.
   - Guardar el PDF o marcar `COMPILE_FAILED` conservando la fuente derivada.

5. `feat(cv-analysis): download and select generated resumes`
   - Exponer descarga de PDF y seleccion explicita del CV de la postulacion.
   - Validar pertenencia, estado y existencia del archivo.

6. `test(latex): cover compilation and resume selection`
   - Probar documento valido, documento invalido, timeout y diagnosticos.
   - Probar seleccion entre postulaciones y requisitos del PDF.

### Commits del Hito 5 - Frontend funcional

1. `chore(web): configure routing and server state`
   - Configurar React Router, TanStack Query, estructura de rutas y cliente HTTP.
   - Definir tipos compartidos dentro del frontend.

2. `feat(web): manage the master LaTeX resume`
   - Crear la vista de carga, version actual, historial y descarga.
   - Incluir estados vacios, carga, validacion y error.

3. `feat(web): manage job applications`
   - Crear listado, busqueda, filtros y formularios de alta y edicion.
   - Mantener las operaciones del tracker independientes del analisis.

4. `feat(web): show application details and timeline`
   - Crear detalle, estado actual, cambio de estado e historial de eventos.
   - Mostrar el CV seleccionado y el historial de analisis.

5. `feat(web): review and select CV analyses`
   - Crear generacion, resumen, brechas, recomendaciones y diff.
   - Implementar descargas, diagnosticos y confirmacion de seleccion.

6. `test(web): cover responsive application workflows`
   - Probar los flujos principales, errores, cargas y estados vacios.
   - Verificar accesibilidad basica y vistas de escritorio y movil.

### Commits del Hito 6 - Calidad y documentacion

1. `test(api): complete service and controller coverage`
   - Cubrir ramas de error y contratos que no hayan quedado probados en los hitos anteriores.

2. `test(e2e): cover the CV tailoring workflow`
   - Probar carga, vacante, analisis, compilacion, seleccion y seguimiento de principio a fin.

3. `fix(app): polish validation and error states`
   - Corregir problemas descubiertos por las pruebas sin introducir nuevas funcionalidades.

4. `docs(readme): document local setup and development workflow`
   - Reemplazar README de plantilla.
   - Documentar dependencias, entorno, Docker, migraciones, seed, pruebas y ejecucion.

5. `chore(env): provide safe environment templates`
   - Crear ejemplos de variables sin secretos.
   - Revisar reglas de archivos ignorados y artefactos generados.

### Regla de entrega de cada commit

Antes de que el usuario escriba un commit, la IA debe proporcionar:

1. Titulo exacto y responsabilidad unica.
2. Dependencias respecto de commits anteriores.
3. Lista exacta de archivos que el usuario creara, modificara o eliminara.
4. Contenido completo de cada archivo creado o modificado.
5. Explicacion linea por linea o por bloques triviales claramente delimitados.
6. Explicacion expresa de cada archivo eliminado y de por que deja de ser necesario.
7. Comandos manuales de formato, generacion, migracion, pruebas y build.
8. Resultado esperado y criterio para detenerse si aparece un error.
9. Comandos para revisar el diff y preparar exclusivamente los archivos del commit.
10. Comando de commit y comprobacion final con `git show`.

No se comenzara el siguiente commit hasta que el usuario haya escrito y verificado el anterior.

## 17. Plan de pruebas

### CV maestro

- Acepta `.tex` UTF-8 valido.
- Rechaza archivo vacio, binario, extension incorrecta y tamano excesivo.
- Reutiliza una version con el mismo SHA-256.
- Descarga exactamente la fuente almacenada.

### Analisis

- Rechaza una vacante inexistente.
- Rechaza analisis sin descripcion o sin CV.
- Usa la version indicada o la actual por defecto.
- Guarda el modelo utilizado.
- Marca `AI_FAILED` ante error de red, respuesta vacia o JSON invalido.
- Conserva recomendaciones rechazadas para auditoria.

### Motor de reemplazos

- Aplica un reemplazo exacto y unico.
- Rechaza fragmentos ausentes o repetidos.
- Rechaza reemplazos identicos.
- Rechaza rangos solapados.
- Aplica multiples reemplazos sin alterar sus posiciones.
- Conserva la fuente original cuando no hay cambios validos.

### Compilacion

- Produce PDF para un documento minimo valido.
- Conserva el `.tex` y el diagnostico para un documento invalido.
- Interrumpe una compilacion que supera el timeout.
- No permite ejecutar comandos mediante `shell-escape`.

### Seleccion del CV

- Solo selecciona analisis de la misma postulacion.
- Requiere PDF valido para una version generada.
- Reemplaza de forma explicita la seleccion anterior.
- Conserva la opcion de PDF manual.

### Regresion del tracker

- Crea, edita, lista, busca y filtra postulaciones.
- Cada cambio de estado genera un evento.
- La eliminacion respeta las relaciones y archivos definidos.
- Los listados no devuelven fuentes LaTeX completas.

### Frontend

- Muestra estados de carga, error y vacio.
- Evita solicitudes duplicadas durante una generacion.
- Presenta recomendaciones y diffs sin desbordar el layout.
- Permite descargar `.tex` y PDF.
- Confirma la seleccion del CV.
- Funciona en escritorio y movil.

## 18. Mecanica de desarrollo guiado

El proyecto se desarrollara un hito por turno.

Cada entrega debe seguir este orden:

1. Objetivo concreto del hito.
2. Estado previo y conceptos necesarios.
3. Lista exacta de archivos a crear y modificar.
4. Codigo completo de cada archivo, no fragmentos ambiguos.
5. Explicacion detallada de imports, tipos, decoradores, validaciones, relaciones y flujo.
6. Las lineas triviales pueden explicarse por bloques cuando hacerlo linea por linea no aporte valor.
7. Comandos que el usuario debe ejecutar manualmente.
8. Resultado esperado de cada comando.
9. Casos de prueba manuales y automatizados.
10. Criterio claro para considerar terminado el hito antes de avanzar.

### Propiedad de la implementacion

- La IA nunca creara, editara, eliminara, movera ni formateara archivos de codigo del proyecto.
- La IA nunca ejecutara migraciones, seeds, generadores, instalaciones, commits ni comandos que
  implementen cambios por cuenta del usuario.
- La IA puede inspeccionar archivos y ejecutar comprobaciones de solo lectura para entender el estado
  del repositorio y preparar una guia correcta.
- La IA entregara codigo completo y explicaciones, pero siempre como texto para que el usuario lo
  escriba manualmente.
- El usuario es el unico responsable de aplicar el codigo, ejecutar los comandos de implementacion,
  revisar el diff y crear cada commit.
- La IA solo podra modificar `PLAN.md` cuando el usuario lo solicite expresamente; esta excepcion no
  autoriza cambios en codigo, configuracion, migraciones, pruebas ni documentacion adicional.
- Si el usuario pide accidentalmente a la IA que implemente codigo, la IA recordara esta regla y
  convertira la solicitud en una guia manual, salvo que el usuario cambie expresamente esta politica
  dentro de `PLAN.md`.

El objetivo es que el usuario comprenda y escriba cada cambio, no solo que obtenga un resultado
funcional.

## 19. Convenciones

- Codigo, identificadores, comentarios y mensajes tecnicos en ingles.
- Explicaciones de desarrollo y justificaciones de IA en espanol.
- DTOs para todo dato de entrada.
- Servicios responsables de reglas de negocio; controladores delgados.
- Acceso a datos mediante `PrismaService`.
- Operaciones relacionadas dentro de transacciones cuando sea necesario.
- No devolver entidades pesadas en endpoints de listado.
- Errores HTTP consistentes y mensajes utiles sin filtrar detalles internos.
- Archivos generados y secretos fuera del control de versiones.
- Una responsabilidad principal por modulo.
- Pruebas proporcionales al riesgo antes de continuar al siguiente hito.

## 20. Mejoras posteriores al MVP

- Proyectos LaTeX completos mediante ZIP seguro.
- Aceptacion o rechazo individual de sugerencias desde la UI.
- Editor LaTeX integrado con previsualizacion.
- Plantillas y multiples CV maestros por perfil profesional.
- Estadisticas de respuesta y tiempo por etapa.
- Recordatorios de seguimiento.
- Exportacion CSV.
- Perfil de empresas y deteccion de duplicados.
- Almacenamiento cloud.
- Autenticacion y soporte multiusuario.
