import { RequireAuth } from "@/app/src/auth/requireAuth";
import { supabase } from "@/app/src/supabase/client";
import { deleteExercise } from "@/app/src/supabase/db";
import { AppHeader } from "@/app/src/ui/appHeader";
import { Card } from "@/app/src/ui/card";
import { Screen } from "@/app/src/ui/screen";
import { theme } from "@/app/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const WEEK: { key: WeekdayKey; label: string }[] = [
  { key: "mon", label: "Lun" },
  { key: "tue", label: "Mar" },
  { key: "wed", label: "Mer" },
  { key: "thu", label: "Gio" },
  { key: "fri", label: "Ven" },
  { key: "sat", label: "Sab" },
  { key: "sun", label: "Dom" },
];

type DbClientRow = {
  id: string;
  name: string;
};

type DbDayRow = {
  id: string;
  client_id: string;
  title: string;
  weekday_key: string | null;
  position: number;
  created_at: string;
};

type DbExerciseRow = {
  id: string;
  day_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_sec: number;
  notes: string | null;
  position: number;
  created_at: string;
};

export default function StudentDetail() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  // ✅ hooks always first
  const [selectedDay, setSelectedDay] = React.useState<WeekdayKey>("mon");
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [activeExerciseId, setActiveExerciseId] = React.useState<string | null>(null);

  const [isLoadingClient, setIsLoadingClient] = React.useState(true);
  const [client, setClient] = React.useState<DbClientRow | null>(null);
  const [days, setDays] = React.useState<DbDayRow[]>([]);

  const [isLoadingExercises, setIsLoadingExercises] = React.useState(false);
  const [exercises, setExercises] = React.useState<DbExerciseRow[]>([]);

  function openActions(exerciseId: string) {
    setActiveExerciseId(exerciseId);
    setActionsOpen(true);
  }

  function closeActions() {
    setActionsOpen(false);
    setActiveExerciseId(null);
  }

  const activeDay = React.useMemo(() => {
    return days.find((d) => d.weekday_key === selectedDay) ?? null;
  }, [days, selectedDay]);

  const fetchExercises = React.useCallback(async (dayId: string) => {
    const { data: ex, error: exErr } = await supabase
      .from("workout_exercises")
      .select("id,day_id,name,sets,reps,rest_sec,notes,position,created_at")
      .eq("day_id", dayId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (exErr) throw exErr;
    setExercises((ex ?? []) as DbExerciseRow[]);
  }, []);

  function onEdit() {
    if (!activeExerciseId) return;

    router.push({
      pathname: "/(pt-tabs)/students/[clientId]/exercise/[exerciseId]",
      params: {
        clientId: String(clientId),
        exerciseId: String(activeExerciseId),
        weekday: selectedDay,
        dayId: String(activeDay?.id ?? ""),
      },
    });

    closeActions();
  }

  async function onDelete() {
    if (!activeExerciseId) return;

    const idToDelete = String(activeExerciseId);

    try {
      console.log("ELIMINA", idToDelete);
      await deleteExercise(idToDelete);
      setExercises((prev) => prev.filter((e) => e.id !== idToDelete));
    } catch (error) {
      console.log("[pt] delete error", error);
    } finally {
      closeActions();
    }
  }

  // 1) load client + days from DB
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingClient(true);
        setClient(null);
        setDays([]);
        setExercises([]);

        const cid = String(clientId);
        if (!cid) {
          if (!alive) return;
          setClient(null);
          setDays([]);
          return;
        }

        // client
        const { data: c, error: cErr } = await supabase
          .from("clients")
          .select("id,name")
          .eq("id", cid)
          .single();

        if (cErr) throw cErr;
        if (!alive) return;
        setClient((c ?? null) as DbClientRow | null);

        // days
        const { data: d, error: dErr } = await supabase
          .from("workout_days")
          .select("id,client_id,title,weekday_key,position,created_at")
          .eq("client_id", cid)
          .order("position", { ascending: true })
          .order("created_at", { ascending: true });

        if (dErr) throw dErr;
        if (!alive) return;
        setDays((d ?? []) as DbDayRow[]);
      } catch (e) {
        console.log("[pt] load client/days error", e);
        if (!alive) return;
        setClient(null);
        setDays([]);
        setExercises([]);
      } finally {
        if (alive) setIsLoadingClient(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clientId]);

  // 2) load exercises for active day
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingExercises(true);

        if (!activeDay?.id) {
          if (!alive) return;
          setExercises([]);
          return;
        }

        await fetchExercises(activeDay.id);
      } catch (e) {
        console.log("[pt] load exercises error", e);
        if (!alive) return;
        setExercises([]);
      } finally {
        if (alive) setIsLoadingExercises(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeDay?.id, fetchExercises]);

  // 🔁 refresh when we come back from the exercise screen
  useFocusEffect(
    React.useCallback(() => {
      let alive = true;

      (async () => {
        try {
          if (!activeDay?.id) return;
          setIsLoadingExercises(true);
          await fetchExercises(activeDay.id);
        } catch (e) {
          console.log("[pt] focus refresh exercises error", e);
          if (alive) setExercises([]);
        } finally {
          if (alive) setIsLoadingExercises(false);
        }
      })();

      return () => {
        alive = false;
      };
    }, [activeDay?.id, fetchExercises])
  );

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title={client ? client.name : "Allievo"} showBack subtitle="Scheda allenamento" />

        {isLoadingClient ? (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <ActivityIndicator />
            <Text style={{ color: theme.colors.subtext, marginTop: 10 }}>Caricamento…</Text>
          </View>
        ) : !client ? (
          <Text style={{ color: theme.colors.subtext, paddingHorizontal: 16, marginTop: 8 }}>
            Allievo non trovato.
          </Text>
        ) : (
          <>
            {/* 7 tab giorni */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 10 }}
              style={{ marginTop: 6 }}
            >
              {WEEK.map((d) => {
                const active = d.key === selectedDay;
                return (
                  <Pressable
                    key={d.key}
                    onPress={() => setSelectedDay(d.key)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? "transparent" : theme.colors.border,
                      backgroundColor: active ? theme.colors.text : "transparent",
                    }}
                  >
                    <Text style={{ color: active ? "#000" : theme.colors.text, fontWeight: "900" }}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* + aggiungi esercizio */}
            <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
              <Pressable
                onPress={() => {
                  console.log("TODO: aggiungi esercizio (pt)");
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Ionicons name="add" size={18} color={theme.colors.text} />
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Aggiungi esercizio</Text>
              </Pressable>
            </View>

            {/* Lista esercizi */}
            <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
              {isLoadingExercises ? (
                <Text style={{ color: theme.colors.subtext }}>Caricamento esercizi…</Text>
              ) : exercises.length === 0 ? (
                <Text style={{ color: theme.colors.subtext }}>Nessun esercizio per questo giorno.</Text>
              ) : (
                exercises.map((ex) => (
                  <Pressable
                    key={ex.id}
                    onPress={() => {
                      router.push({
                        pathname: "/(pt-tabs)/students/[clientId]/exercise/[exerciseId]",
                        params: {
                          clientId: String(clientId),
                          exerciseId: String(ex.id),
                          weekday: selectedDay,
                          dayId: String(ex.day_id),
                        },
                      });
                    }}
                    style={{ borderRadius: theme.radius.lg }}
                  >
                    <Card>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        {/* Placeholder immagine */}
                        <View
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 10,
                            backgroundColor: theme.colors.border,
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Ionicons name="image-outline" size={22} color={theme.colors.subtext} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
                            {ex.name}
                          </Text>

                          <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>
                            {ex.sets} serie × {ex.reps} reps • Rec {ex.rest_sec}s
                          </Text>

                          {ex.notes ? (
                            <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>Note: {ex.notes}</Text>
                          ) : null}
                        </View>

                        <Pressable
                          onPress={(e: any) => {
                            e?.stopPropagation?.();
                            openActions(String(ex.id));
                          }}
                          style={{ padding: 6 }}
                          hitSlop={10}
                        >
                          <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.subtext} />
                        </Pressable>
                      </View>
                    </Card>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}

        {/* Action sheet */}
        <Modal visible={actionsOpen} transparent animationType="fade" onRequestClose={closeActions}>
          <Pressable
            onPress={closeActions}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.55)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: 14,
                paddingBottom: 18,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View style={{ alignItems: "center", paddingVertical: 8 }}>
                <View
                  style={{
                    width: 44,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: theme.colors.border,
                  }}
                />
              </View>

              <Pressable onPress={onEdit} style={{ paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Modifica</Text>
              </Pressable>

              <Pressable onPress={onDelete} style={{ paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 }}>
                <Text style={{ color: "#ff5a5a", fontWeight: "900", fontSize: 16 }}>Elimina</Text>
              </Pressable>

              <Pressable
                onPress={closeActions}
                style={{ marginTop: 6, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 }}
              >
                <Text style={{ color: theme.colors.subtext, fontWeight: "800", fontSize: 15 }}>Annulla</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </Screen>
    </RequireAuth>
  );
}