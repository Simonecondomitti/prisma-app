import { RequireAuth } from "@/app/src/auth/requireAuth";
import { supabase } from "@/app/src/supabase/client";
import { Screen } from "@/app/src/ui/screen";
import { theme } from "@/app/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const REST_OPTIONS = [30, 60, 90] as const;

type DbExerciseRow = {
  id: string;
  day_id: string;
  name: string;
  sets: number;
  reps: string;
  kg: number | null;
  rest_sec: number;
  notes: string | null;
  // join
  workout_days?: {
    id?: string;
    title: string;
    weekday_key: string | null;
    client_id: string;
    clients?: {
      name: string;
    } | null;
  } | null;
};

function weekdayLabel(wk?: string | null) {
  switch (wk) {
    case "mon":
      return "Lunedì";
    case "tue":
      return "Martedì";
    case "wed":
      return "Mercoledì";
    case "thu":
      return "Giovedì";
    case "fri":
      return "Venerdì";
    case "sat":
      return "Sabato";
    case "sun":
      return "Domenica";
    default:
      return "Giorno";
  }
}

function parseDecimal(input: string): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  // Supports: "2,5" and "1.000,50" (Italian format)
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export default function PtExerciseDetail() {
  const { clientId, exerciseId } = useLocalSearchParams<{
    clientId: string;
    exerciseId: string;
  }>();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [row, setRow] = React.useState<DbExerciseRow | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // form state
  const [sets, setSets] = React.useState("0");
  const [reps, setReps] = React.useState("");
  const [kg, setKg] = React.useState("");
  const [restSec, setRestSec] = React.useState<number>(60);
  const [notes, setNotes] = React.useState("");

  // keep initial snapshot to compute "dirty"
  const initialRef = React.useRef<{ sets: string; reps: string; kg: string; restSec: number; notes: string } | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        setRow(null);

        const exId = String(exerciseId);
        if (!exId) throw new Error("exerciseId mancante");

        // Load the exercise and join day + client name for the header.
        const { data, error } = await supabase
          .from("workout_exercises")
          .select(
            "id,day_id,name,sets,reps,kg,rest_sec,notes,workout_days(id,title,weekday_key,client_id,clients(name))"
          )
          .eq("id", exId)
          .single();

        if (error) throw error;
        if (!alive) return;

        const ex = (data ?? null) as DbExerciseRow | null;
        setRow(ex);

        // init form
        const nextSets = String(ex?.sets ?? 0);
        const nextReps = String(ex?.reps ?? "");
        const nextKg = ex?.kg === null || ex?.kg === undefined ? "" : String(ex.kg);
        const nextRest = Number(ex?.rest_sec ?? 60);
        const nextNotes = String(ex?.notes ?? "");

        setSets(nextSets);
        setReps(nextReps);
        setKg(nextKg);
        setRestSec(nextRest);
        setNotes(nextNotes);

        initialRef.current = {
          sets: nextSets,
          reps: nextReps,
          kg: nextKg,
          restSec: nextRest,
          notes: nextNotes,
        };

        // Optional: sanity check route clientId vs DB
        const routeCid = String(clientId ?? "");
        const dbCid = String(ex?.workout_days?.client_id ?? "");
        if (routeCid && dbCid && routeCid !== dbCid) {
          console.log("[pt] route clientId mismatch", { routeCid, dbCid });
        }
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
  }, [exerciseId, clientId]);

  const headerLabel = React.useMemo(() => {
    const dayTitle = row?.workout_days?.title;
    const wk = row?.workout_days?.weekday_key;
    const dayLabel = dayTitle?.trim() ? dayTitle : weekdayLabel(wk);
    const exName = row?.name ?? "";

    // Desired: "< Lunedì — Panca piana"
    if (!dayLabel) return exName || "Esercizio";
    return `${dayLabel} — ${exName}`.trim();
  }, [row]);

  const isDirty = React.useMemo(() => {
    const init = initialRef.current;
    if (!init) return false;

    const cur = {
      sets: String(sets),
      reps: String(reps),
      kg: String(kg),
      restSec: Number(restSec),
      notes: String(notes ?? ""),
    };

    return (
      cur.sets !== init.sets ||
      cur.reps !== init.reps ||
      cur.kg !== init.kg ||
      cur.restSec !== init.restSec ||
      cur.notes !== init.notes
    );
  }, [sets, reps, kg, restSec, notes]);

  const onSave = async () => {
    if (!row) return;
    if (!isDirty) return;

    try {
      setSaving(true);

      const patch = {
        sets: Number(sets) || 0,
        reps: String(reps ?? ""),
        kg: parseDecimal(kg),
        rest_sec: Number(restSec) || 0,
        notes: String(notes ?? "").trim() === "" ? null : String(notes),
      };

      const { error } = await supabase
        .from("workout_exercises")
        .update(patch)
        .eq("id", row.id);

      if (error) throw error;

      // update local row + reset dirty snapshot
      setRow((prev) => (prev ? { ...prev, ...patch } as any : prev));
      initialRef.current = {
        sets: String(patch.sets),
        reps: String(patch.reps),
        kg: String(kg ?? ""),
        restSec: Number(patch.rest_sec),
        notes: String(patch.notes ?? ""),
      };

      console.log("SALVA (PT)", { exerciseId: row.id, ...patch, kg });
      router.back();
    } catch (e: any) {
      console.log("[pt] save error", e);
      Alert.alert("Errore", e?.message ?? "Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth role="pt">
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
          {/* Header custom */}
          <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{headerLabel}</Text>
          </Pressable>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ color: theme.colors.subtext, marginTop: 10 }}>Caricamento esercizio…</Text>
            </View>
          ) : !row ? (
            <View style={{ paddingVertical: 18 }}>
              <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "900" }}>Esercizio non trovato</Text>
              {loadError ? <Text style={{ color: theme.colors.subtext, marginTop: 10 }}>{loadError}</Text> : null}
            </View>
          ) : (
            <>
              {/* Media placeholder */}
              <View
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.card,
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
                        <Text style={{ color: active ? "#000" : theme.colors.text, fontWeight: "800" }}>{s}s</Text>
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

              <Pressable
                onPress={onSave}
                disabled={saving || !isDirty}
                style={{
                  marginTop: 6,
                  height: 54,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.card,
                  opacity: saving || !isDirty ? 0.55 : 1,
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
  backgroundColor: theme.colors.card,
} as const;