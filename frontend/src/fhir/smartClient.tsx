import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";

export interface SmartClientState {
  accessToken: string;
  fhirBaseUrl: string;
  patientId: string;
}

interface SmartContextValue {
  clientState: SmartClientState | null;
  loading: boolean;
  error: string | null;
}

const SmartContext = createContext<SmartContextValue>({
  clientState: null,
  loading: false,
  error: null
});

function getInitialSmartValue(): SmartContextValue {
  if (typeof window === "undefined") {
    return { clientState: null, loading: true, error: null };
  }
  const params = new URLSearchParams(window.location.search);
  const hasSmartParams = params.get("code") || params.get("iss") || params.get("launch");
  return {
    clientState: null,
    loading: !!hasSmartParams,
    error: null
  };
}

export const SmartProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [value, setValue] = useState<SmartContextValue>(getInitialSmartValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const iss = params.get("iss");
    const launch = params.get("launch");

    const isSmartContext = Boolean(code || iss || launch);

    if (!isSmartContext) {
      setValue({ clientState: null, loading: false, error: null });
      return;
    }

    const clientId = import.meta.env.VITE_EPIC_CLIENT_ID as string | undefined;
    const scope =
      (import.meta.env.VITE_EPIC_SCOPE as string | undefined) ??
      "launch openid fhirUser patient/Patient.read patient/Observation.read patient/MedicationRequest.read patient/Condition.read patient/Encounter.read";

    if (!clientId) {
      setValue({
        clientState: null,
        loading: false,
        error: "SMART client ID (VITE_EPIC_CLIENT_ID) is not configured."
      });
      return;
    }

    const run = async () => {
      try {
        const { default: FHIR } = await import("fhirclient");

        if (!code) {
          await FHIR.oauth2.authorize({
            clientId,
            scope,
            redirectUri: window.location.origin + window.location.pathname,
            iss: iss ?? undefined,
            launch: launch ?? undefined
          });
          return;
        }

        const client = await FHIR.oauth2.ready();

        const accessToken =
          client.state.tokenResponse?.access_token ??
          client.state.tokenResponse?.id_token;

        const fhirBaseUrl = client.state.serverUrl as string;
        const patientId = client.patient.id ?? "";

        if (!accessToken || !fhirBaseUrl || !patientId) {
          setValue({
            clientState: null,
            loading: false,
            error: "SMART context is incomplete. Falling back to mock data."
          });
          return;
        }

        setValue({
          clientState: {
            accessToken,
            fhirBaseUrl,
            patientId
          },
          loading: false,
          error: null
        });
      } catch (err) {
        console.error(err);
        setValue({
          clientState: null,
          loading: false,
          error:
            "Unable to initialize SMART on FHIR context. Using mock data if available."
        });
      }
    };

    void run();
  }, []);

  return (
    <SmartContext.Provider value={value}>{children}</SmartContext.Provider>
  );
};

export const useSmartContext = (): SmartContextValue => useContext(SmartContext);
