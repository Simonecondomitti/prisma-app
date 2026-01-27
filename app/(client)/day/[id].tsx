import { RequireAuth } from "@/app/src/auth/requireAuth";
import { getDayById } from "@/app/src/mock/workout";
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

export default function ClientDayDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const day = getDayById(String(id));

  return (
    <RequireAuth role="client">
      <Screen>
        <AppHeader title={day ? day.title : "Giorno non trovato"} showBack />

        {!day ? null : (
          <>
            {day.exercises.map((ex) => (
              <RowLink
                key={ex.id}
                title={ex.name}
                subtitle={`${ex.sets} serie × ${ex.reps} • Recupero ${formatRest(ex.restSec)}${ex.notes ? ` • Note: ${ex.notes}` : ""}`}
                onPress={() => router.push(`/(client)/exercise/${ex.id}`)}
              />
            ))}
          </>
        )}
      </Screen>
    </RequireAuth>
  );
}