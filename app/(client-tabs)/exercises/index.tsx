import { useAuth } from "@/app/src/auth/authContext";
import { RequireAuth } from "@/app/src/auth/requireAuth";
import { supabase } from "@/app/src/supabase/client";
import { deleteExercise } from "@/app/src/supabase/db";
import { AppHeader } from "@/app/src/ui/appHeader";
import { Card } from "@/app/src/ui/card";
import { Screen } from "@/app/src/ui/screen";
import { theme } from "@/app/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

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
};

export default function ClientExercisesTab() {
  const { user } = useAuth();

  // ✅ hooks ALWAYS before any return
  const [selectedDay, setSelectedDay] = React.useState<WeekdayKey>("mon");
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [activeExerciseId, setActiveExerciseId] = React.useState<string | null>(null);

  // Data from Supabase
  const [isLoading, setIsLoading] = React.useState(true);
  const [client, setClient] = React.useState<DbClientRow | null>(null);
  const [days, setDays] = React.useState<DbDayRow[]>([]);
  const [exercises, setExercises] = React.useState<DbExerciseRow[]>([]);

  function openActions(exerciseId: string) {
    setActiveExerciseId(exerciseId);
    setActionsOpen(true);
  }

  function closeActions() {
    setActionsOpen(false);
    setActiveExerciseId(null);
  }

  function onEdit() {
    if (!activeExerciseId) return;

    router.push({
      pathname: "/(client-tabs)/exercises/exercise/[exerciseId]",
      params: {
        exerciseId: String(activeExerciseId),
        weekday: selectedDay,
      },
    });

    closeActions();
  }

  async function onDelete() {
    if (!activeExerciseId) return;

    const idToDelete = String(activeExerciseId);

    try {
      // elimina in DB
      await deleteExercise(idToDelete);

      // aggiorna UI senza refetch
      setExercises((prev) => prev.filter((e) => e.id !== idToDelete));
    } catch (error) {
      console.log("[client] delete error", error);
    } finally {
      closeActions();
    }
  }

  // 1) Carica il client associato all'utente loggato (clients.client_user_id = user.id)
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoading(true);

        if (!user?.id) {
          if (!alive) return;
          setClient(null);
          setDays([]);
          setExercises([]);
          return;
        }

        const { data: c, error: cErr } = await supabase
          .from("clients")
          .select("id,name")
          .eq("client_user_id", user.id)
          .single();

        if (!alive) return;

        if (cErr) {
          console.log("[client] load client error", cErr);
          setClient(null);
          setDays([]);
          setExercises([]);
          return;
        }

        setClient(c as DbClientRow);

        const { data: d, error: dErr } = await supabase
          .from("workout_days")
          .select("id,client_id,title,weekday_key,position")
          .eq("client_id", (c as DbClientRow).id)
          .order("position", { ascending: true })
          .order("created_at", { ascending: true });

        if (!alive) return;

        if (dErr) {
          console.log("[client] load days error", dErr);
          setDays([]);
          setExercises([]);
          return;
        }

        setDays((d ?? []) as DbDayRow[]);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  // 2) Ogni volta che cambia selectedDay o days, carica gli esercizi del day attivo
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!client?.id) return;

        const activeDay = days.find((d) => d.weekday_key === selectedDay) ?? null;
        if (!activeDay) {
          setExercises([]);
          return;
        }

        const { data: ex, error: exErr } = await supabase
          .from("workout_exercises")
          .select("id,day_id,name,sets,reps,rest_sec,notes,position")
          .eq("day_id", activeDay.id)
          .order("position", { ascending: true })
          .order("created_at", { ascending: true });

        if (!alive) return;

        if (exErr) {
          console.log("[client] load exercises error", exErr);
          setExercises([]);
          return;
        }

        setExercises((ex ?? []) as DbExerciseRow[]);
      } catch (e) {
        console.log("[client] load exercises unexpected", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [client?.id, days, selectedDay]);

  return (
    <RequireAuth role="client">
      <Screen>
        <AppHeader title="La tua scheda" subtitle="Ultimo aggiornamento" />

        {isLoading ? (
          <Text style={{ color: theme.colors.subtext, paddingHorizontal: 16, marginTop: 8 }}>
            Caricamento...
          </Text>
        ) : !client ? (
          <Text style={{ color: theme.colors.subtext, paddingHorizontal: 16, marginTop: 8 }}>
            Nessun cliente collegato a questo account.
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

            {/* + aggiungi esercizio (client: solo placeholder per ora) */}
            <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
              <Pressable
                onPress={() => {
                  console.log("TODO: aggiungi esercizio (client)");
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
              {exercises.length === 0 ? (
                <Text style={{ color: theme.colors.subtext }}>Nessun esercizio per questo giorno.</Text>
              ) : (
                exercises.map((ex) => (
                  <Pressable
                    key={ex.id}
                    onPress={() => {
                      router.push({
                        pathname: "/(client-tabs)/exercises/exercise/[exerciseId]",
                        params: {
                          exerciseId: String(ex.id),
                          weekday: selectedDay,
                        },
                      });
                    }}
                    style={{ borderRadius: theme.radius.lg }}
                  >
                    <Card>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        {/* Placeholder immagine esercizio (quadrata a sinistra) */}
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

                        {/* Contenuto */}
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

                        {/* 3 puntini */}
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

            {/* Action sheet */}
            <Modal visible={actionsOpen} transparent animationType="fade" onRequestClose={closeActions}>
              {/* Backdrop */}
              <Pressable
                onPress={closeActions}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  justifyContent: "flex-end",
                }}
              >
                {/* Sheet */}
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

                  <Pressable
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      onEdit();
                    }}
                    style={{ paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 }}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Modifica</Text>
                  </Pressable>

                  <Pressable
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      onDelete();
                    }}
                    style={{ paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 }}
                  >
                    <Text style={{ color: "#ff5a5a", fontWeight: "900", fontSize: 16 }}>Elimina</Text>
                  </Pressable>

                  <Pressable
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      closeActions();
                    }}
                    style={{ marginTop: 6, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 }}
                  >
                    <Text style={{ color: theme.colors.subtext, fontWeight: "800", fontSize: 15 }}>Annulla</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </>
        )}
      </Screen>
    </RequireAuth>
  );
}