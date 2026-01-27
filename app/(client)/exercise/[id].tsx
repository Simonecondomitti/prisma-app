import { RequireAuth } from "@/app/src/auth/requireAuth";
import { MOCK_DAYS } from "@/app/src/mock/workout";
import { AppHeader } from "@/app/src/ui/appHeader";
import { Card } from "@/app/src/ui/card";
import { Screen } from "@/app/src/ui/screen";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

function findExerciseById(id: string) {
  for (const day of MOCK_DAYS) {
    const found = day.exercises.find((e) => e.id === id);
    if (found) return found;
  }
  return null;
}

function formatRest(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = findExerciseById(String(id));

  return (
    <RequireAuth role="client">
      <Screen>
        <AppHeader title={ex ? ex.name : "Esercizio non trovato"} showBack />

        {!ex ? (
          <Text style={{ color: "#444" }}>ID: {String(id)}</Text>
        ) : (
          <>
            <Card>
              <Text style={{ color: "#444" }}>
                {ex.sets} serie × {ex.reps} • Recupero {formatRest(ex.restSec)}
              </Text>
              {ex.notes ? <Text style={{ color: "#444" }}>Note: {ex.notes}</Text> : null}
            </Card>

            {ex.muscles?.length ? (
              <Card>
                <Text style={{ fontWeight: "800", color: "#111" }}>Muscoli</Text>
                <Text style={{ color: "#444" }}>{ex.muscles.join(", ")}</Text>
              </Card>
            ) : null}

            <Card>
              <Text style={{ fontWeight: "800", color: "#111" }}>Esecuzione</Text>
              <Text style={{ color: "#444" }}>
                {ex.description ?? "Descrizione non disponibile (mock)."}
              </Text>
            </Card>

            <View
              style={{
                height: 180,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#eee",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#444" }}>📹 Video/Immagine (in futuro)</Text>
            </View>
          </>
        )}
      </Screen>
    </RequireAuth>
  );
}