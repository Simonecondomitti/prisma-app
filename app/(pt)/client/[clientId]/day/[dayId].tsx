import { RequireAuth } from "@/app/src/auth/requireAuth";
import { usePtStore } from "@/app/src/pt/PtStore";
import { AppHeader } from "@/app/src/ui/appHeader";
import { RowLink } from "@/app/src/ui/rowLink";
import { Screen } from "@/app/src/ui/screen";
import { router, useLocalSearchParams } from "expo-router";

function formatRest(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export default function PtClientDayDetail() {
  const { clientId, dayId } = useLocalSearchParams<{ clientId: string; dayId: string }>();

  const { getClientById } = usePtStore();
  const client = getClientById(String(clientId));
  const day = client?.planDays.find((d) => d.id === String(dayId)) ?? null;

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title={client ? client.name : "Cliente"} showBack />
        <AppHeader title={day ? day.title : "Giorno non trovato"} subtitle="Esercizi" />
        <RowLink
          title="Modifica questo giorno"
          subtitle="Apri editor"
          onPress={() =>
            router.push({
              pathname: "/(pt)/client/[clientId]/edit/[dayId]",
              params: { clientId: String(clientId), dayId: String(dayId) },
            })
          }
        />
        {!day ? null : (
          <>
            {day.exercises.map((ex) => (
              <RowLink
                key={ex.id}
                title={ex.name}
                subtitle={`${ex.sets}×${ex.reps} • Rec ${formatRest(ex.restSec)}${ex.notes ? ` • ${ex.notes}` : ""}`}
                // per ora riusiamo la pagina exercise del client (mock)
                onPress={() => router.push(`/(client)/exercise/${ex.id}`)}
              />
            ))}
          </>
        )}
      </Screen>
    </RequireAuth>
  );
}