import type { AccessMode } from "./ai-model-rankings";

/** Spanish labels for documented access routes; English uses the stored value unchanged. */
export const accessTranslations: Record<AccessMode, string> = {
  "Free access": "Acceso gratuito",
  Subscription: "Suscripción",
  API: "API",
  "Open weights": "Pesos abiertos",
  "Regional access": "Acceso regional",
};
