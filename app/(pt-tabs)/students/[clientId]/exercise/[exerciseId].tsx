import { RequireAuth } from "@/app/src/auth/requireAuth";
import { usePtStore } from "@/app/src/pt/PtStore";
import { Screen } from "@/app/src/ui/screen";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const REST_OPTIONS = [30, 60, 90];

export default function PtExerciseDetail() {
  const { clientId, exerciseId, weekday } = useLocalSearchParams<{
    clientId: string;
    exerciseId: string;
    weekday?: string; // es: "mon"
  }>();

  const { getClientById, updateExercise } = usePtStore();

  const client = useMemo(() => getClientById(String(clientId)), [clientId, getClientById]);

  const dayId = String(weekday ?? "mon"); // fallback lunedì
  const exercise = useMemo(() => {
    const day = client?.planDays?.find((d) => d.id === dayId);
    return day?.exercises?.find((e) => e.id === String(exerciseId)) ?? null;
  }, [client, dayId, exerciseId]);

  const headerLabel = useMemo(() => {
    const dayLabel =
      dayId === "mon" ? "Lunedì" :
      dayId === "tue" ? "Martedì" :
      dayId === "wed" ? "Mercoledì" :
      dayId === "thu" ? "Giovedì" :
      dayId === "fri" ? "Venerdì" :
      dayId === "sat" ? "Sabato" : "Domenica";
    return `${dayLabel} - ${exercise?.name ?? ""}`;
  }, [dayId, exercise?.name]);

  // form state (fallback safe)
  const [sets, setSets] = useState(String(exercise?.sets ?? 3));
  const [reps, setReps] = useState(String(exercise?.reps ?? "10"));
  const [kg, setKg] = useState(""); // non esiste nel model ancora → lo mettiamo solo UI per ora
  const [restSec, setRestSec] = useState<number>(exercise?.restSec ?? 60);
  const [notes, setNotes] = useState(exercise?.notes ?? "");

  if (!client) {
    return (
      <RequireAuth role="pt">
        <Screen>
          <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>Cliente non trovato</Text>
        </Screen>
      </RequireAuth>
    );
  }

  if (!exercise) {
    return (
      <RequireAuth role="pt">
        <Screen>
          <Pressable onPress={() => router.back()} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={{ color: "#fff" }}>Indietro</Text>
          </Pressable>
          <Text style={{ color: "white", fontSize: 22, fontWeight: "800", marginTop: 12 }}>
            Esercizio non trovato
          </Text>
        </Screen>
      </RequireAuth>
    );
  }

  const onSave = () => {
    console.log("SALVA", { clientId, dayId, exerciseId, sets, reps, kg, restSec, notes });

    updateExercise(String(clientId), dayId, String(exerciseId), {
      sets: Number(sets) || 0,
      reps: reps,
      restSec,
      notes,
    });

    router.back();
  };

  return (
    <RequireAuth role="pt">
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
          {/* Header custom tipo "< Lunedì - Panca piana" */}
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700" }}>{headerLabel}</Text>
          </Pressable>

          {/* Placeholder media */}
          <View style={{ borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80" }}
              style={{ width: "100%", height: 180, opacity: 0.9 }}
              resizeMode="cover"
            />
          </View>

          {/* Inputs */}
          <Field label="Ripetizioni">
            <TextInput
              value={reps}
              onChangeText={setReps}
              keyboardType="default"
              placeholder="Es: 8-10"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={inputStyle}
            />
          </Field>

          <Field label="Serie">
            <TextInput
              value={sets}
              onChangeText={setSets}
              keyboardType="number-pad"
              placeholder="Es: 4"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={inputStyle}
            />
          </Field>

          <Field label="Kg">
            <TextInput
              value={kg}
              onChangeText={setKg}
              keyboardType="decimal-pad"
              placeholder="Es: 60"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={inputStyle}
            />
          </Field>

          <Field label="Riposo">
            <View style={{ flexDirection: "row", gap: 10 }}>
              {REST_OPTIONS.map((s) => {
                const active = restSec === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setRestSec(s)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.12)",
                      backgroundColor: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>{s}s</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Commento">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Scrivi una nota per l’esercizio..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              style={[inputStyle, { minHeight: 110, textAlignVertical: "top" }]}
            />
          </Field>

          {/* Save */}
          <Pressable
            onPress={onSave}
            style={{
              marginTop: 6,
              height: 54,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Salva</Text>
          </Pressable>
        </ScrollView>
      </Screen>
    </RequireAuth>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "rgba(255,255,255,0.75)", fontWeight: "700" }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  height: 50,
  borderRadius: 14,
  paddingHorizontal: 14,
  color: "#fff",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  backgroundColor: "rgba(255,255,255,0.04)",
} as const;