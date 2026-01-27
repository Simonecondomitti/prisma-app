import { RequireAuth } from "@/app/src/auth/requireAuth";
import { EXERCISE_CATALOG } from "@/app/src/mock/exerciseCatalog";
import { usePtStore } from "@/app/src/pt/PtStore";
import { AppHeader } from "@/app/src/ui/appHeader";
import { RowLink } from "@/app/src/ui/rowLink";
import { Screen } from "@/app/src/ui/screen";
import { router, useLocalSearchParams } from "expo-router";

export default function PtAddExercise() {
  const { clientId, dayId } = useLocalSearchParams<{ clientId: string; dayId: string }>();
  const { addExercise, isHydrating } = usePtStore();
  if (isHydrating) return null;

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title="Aggiungi esercizio" showBack subtitle="Catalogo (mock)" />

        {EXERCISE_CATALOG.map((c) => (
          <RowLink
            key={c.id}
            title={c.name}
            subtitle={c.muscles?.join(", ") ?? ""}
            onPress={() => {
              addExercise(String(clientId), String(dayId), {
                id: `ex_${Date.now()}`,
                name: c.name,
                sets: 3,
                reps: "10",
                restSec: 60,
                notes: "",
                muscles: c.muscles,
                description: c.description,
              });
              router.back();
            }}
          />
        ))}
      </Screen>
    </RequireAuth>
  );
}