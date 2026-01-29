import { RequireAuth } from "@/app/src/auth/requireAuth";
import { supabase } from "@/app/src/supabase/client";
import { Screen } from "@/app/src/ui/screen";
import { theme } from "@/app/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const REST_OPTIONS = [30, 60, 90] as const;

type DbExerciseRow = {
  id: string;
  day_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_sec: number;
  notes: string | null;
  // joined
  workout_days?: {
    title: string;
    weekday_key: string | null;
  } | null;
};

export default function ClientExerciseDetail() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [row, setRow] = React.useState<DbExerciseRow | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // form state
  const [sets, setSets] = React.useState("3");
  const [reps, setReps] = React.useState("10");
  const [kg, setKg] = React.useState(""); // UI only (non esiste ancora in DB)
  const [restSec, setRestSec] = React.useState<number>(60);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // Leggiamo l'esercizio direttamente da Supabase.
        // Non dipende da weekday "mon" ecc: l'id è UUID.
        const { data, error } = await supabase
          .from("workout_exercises")
          .select("id, day_id, name, sets, reps, rest_sec, notes, workout_days(title, weekday_key)")
          .eq("id", String(exerciseId))
          .single();

        if (error) throw error;
        if (!alive) return;

        const ex = (data ?? null) as DbExerciseRow | null;
        setRow(ex);

        // inizializza form
        setSets(String(ex?.sets ?? 3));
        setReps(String(ex?.reps ?? "10"));
        setRestSec(Number(ex?.rest_sec ?? 60));
        setNotes(String(ex?.notes ?? ""));
      } catch (e: any) {
        if (!alive) return;
        setRow(null);
        setLoadError(e?.message ?? "Errore nel caricamento");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [exerciseId]);

  const headerLabel = React.useMemo(() => {
    const title = row?.workout_days?.title;
    if (title) return title;

    const wk = row?.workout_days?.weekday_key;
    const dayLabel =
      wk === "mon" ? "Lunedì" :
        wk === "tue" ? "Martedì" :
          wk === "wed" ? "Mercoledì" :
            wk === "thu" ? "Giovedì" :
              wk === "fri" ? "Venerdì" :
                wk === "sat" ? "Sabato" :
                  wk === "sun" ? "Domenica" :
                    "Esercizio";

    return `${dayLabel} — ${row?.name ?? ""}`.trim();
  }, [row]);

  const onSave = async () => {
    if (!row) return;

    try {
      setSaving(true);

      const patch = {
        sets: Number(sets) || 0,
        reps: String(reps ?? ""),
        rest_sec: Number(restSec) || 0,
        notes: String(notes ?? "").trim() === "" ? null : String(notes),
      };

      const { error } = await supabase
        .from("workout_exercises")
        .update(patch)
        .eq("id", row.id);

      if (error) throw error;

      console.log("SALVA (CLIENT)", { exerciseId: row.id, ...patch, kg });
      router.back();
    } catch (e: any) {
      console.log("ERRORE SALVATAGGIO", e);
      // UX minima per ora
      alert(e?.message ?? "Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth role="client">
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
          {/* Header custom tipo "< Lunedì - Panca piana" */}
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{headerLabel}</Text>
          </Pressable>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ color: theme.colors.subtext, marginTop: 10 }}>Caricamento esercizio…</Text>
            </View>
          ) : !row ? (
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "900" }}>
                Esercizio non trovato
              </Text>
              {loadError ? (
                <Text style={{ color: theme.colors.subtext, marginTop: 8 }}>{loadError}</Text>
              ) : null}
            </View>
          ) : (
            <>
              {/* Placeholder media */}
              <View
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
                  }}
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
                  placeholderTextColor={theme.colors.subtext}
                  style={inputStyle}
                />
              </Field>

              <Field label="Serie">
                <TextInput
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                  placeholder="Es: 4"
                  placeholderTextColor={theme.colors.subtext}
                  style={inputStyle}
                />
              </Field>

              <Field label="Kg">
                <TextInput
                  value={kg}
                  onChangeText={setKg}
                  keyboardType="decimal-pad"
                  placeholder="Es: 60"
                  placeholderTextColor={theme.colors.subtext}
                  style={inputStyle}
                />
              </Field>

              <Field label="Riposo">
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
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
                          borderColor: active ? theme.colors.text : theme.colors.border,
                          backgroundColor: active ? theme.colors.text : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: active ? "#000" : theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {s}s
                        </Text>
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
                  placeholderTextColor={theme.colors.subtext}
                  multiline
                  style={[inputStyle, { minHeight: 110, textAlignVertical: "top" }]}
                />
              </Field>

              {/* Save */}
              <Pressable
                onPress={onSave}
                disabled={saving}
                style={{
                  marginTop: 6,
                  height: 54,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
                  {saving ? "Salvataggio…" : "Salva"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </Screen>
    </RequireAuth>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.colors.subtext, fontWeight: "800" }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  height: 50,
  borderRadius: 14,
  paddingHorizontal: 14,
  color: theme.colors.text,
  borderWidth: 1,
  borderColor: theme.colors.border,
} as const;