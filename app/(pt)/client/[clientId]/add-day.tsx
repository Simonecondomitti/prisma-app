import { router, useLocalSearchParams } from "expo-router";

import { RequireAuth } from "../../../src/auth/requireAuth";
import { usePtStore } from "../../../src/pt/PtStore";
import { AppHeader } from "../../../src/ui/appHeader";
import { RowLink } from "../../../src/ui/rowLink";
import { Screen } from "../../../src/ui/screen";

const WEEKDAYS = [
  { key: "mon", label: "Lunedì" },
  { key: "tue", label: "Martedì" },
  { key: "wed", label: "Mercoledì" },
  { key: "thu", label: "Giovedì" },
  { key: "fri", label: "Venerdì" },
  { key: "sat", label: "Sabato" },
  { key: "sun", label: "Domenica" },
] as const;

export default function PtAddDay() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { getClientById, addDay, isHydrating } = usePtStore();
  if (isHydrating) return null;

  const client = getClientById(String(clientId));

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title="Aggiungi giorno" showBack subtitle={client?.name} />

        {WEEKDAYS.map((d) => (
          <RowLink
            key={d.key}
            title={d.label}
            subtitle="Crea giorno in scheda"
            onPress={() => {
              const newDayId = addDay(String(clientId), d.key, d.label);
              router.replace({
                pathname: "/(pt)/client/[clientId]/edit/[dayId]",
                params: { clientId: String(clientId), dayId: newDayId },
              });
            }}
          />
        ))}
      </Screen>
    </RequireAuth>
  );
}