import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { applicationQueryKeys, createApplication } from "./application-api";
import { getApplicationErrorMessage } from "./application-error";
import { ApplicationForm } from "./application-form";
import {
  createEmptyApplicationFormValues,
  toCreateApplicationInput,
} from "./application-form-model";
import type { ApplicationFormValues } from "./application-form-model";

const EMPTY_FORM_VALUES = createEmptyApplicationFormValues();

export function NewApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createApplication,
  });

  async function handleSubmit(values: ApplicationFormValues): Promise<void> {
    const input = toCreateApplicationInput(values);

    const createdApplication = await createMutation.mutateAsync(input);

    void queryClient.invalidateQueries({
      queryKey: applicationQueryKeys.lists(),
    });

    void navigate(`/applications/${createdApplication.id}`, {
      replace: true,
    });
  }

  const serverError = createMutation.isError
    ? getApplicationErrorMessage(
        createMutation.error,
        "No pudimos crear la postulación. Intenta nuevamente.",
      )
    : null;

  return (
    <div className="w-full min-w-0">
      <header className="border-b border-line pb-5">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
          Nueva postulación
        </h1>

        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-foreground-muted">
          Registra la vacante y conserva el contexto necesario para darle
          seguimiento.
        </p>
      </header>

      <div>
        <ApplicationForm
          initialValues={EMPTY_FORM_VALUES}
          isSubmitting={createMutation.isPending}
          mode="create"
          onCancel={() => {
            void navigate("/applications");
          }}
          onSubmit={handleSubmit}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
