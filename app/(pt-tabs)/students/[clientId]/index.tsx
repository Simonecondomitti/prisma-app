import { RequireAuth } from "@/app/src/auth/requireAuth";
import { usePtStore } from "@/app/src/pt/PtStore";
import { AppHeader } from "@/app/src/ui/appHeader";
import { Card } from "@/app/src/ui/card";
import { Screen } from "@/app/src/ui/screen";
import { theme } from "@/app/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

export default function StudentDetail() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { getClientById, isHydrating } = usePtStore();

  // ✅ tutti gli hook SEMPRE qui, prima di qualsiasi return
  const [selectedDay, setSelectedDay] = React.useState<WeekdayKey>("mon");
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [activeExerciseId, setActiveExerciseId] = React.useState<string | null>(null);

  if (isHydrating) {
    return (
      <RequireAuth role="pt">
        <Screen>
          <AppHeader title="Caricamento..." subtitle="Scheda allenamento" showBack />
        </Screen>
      </RequireAuth>
    );
  }

  const client = getClientById(String(clientId));

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
    console.log("MODIFICA", activeExerciseId);
    router.push({
      pathname: "/(pt-tabs)/students/[clientId]/exercise/[exerciseId]",
      params: {
        clientId: String(clientId),
        exerciseId: String(activeExerciseId),
        weekday: selectedDay,
      },
    });
    closeActions();
  }

  function onDelete() {
    if (!activeExerciseId) return;
    console.log("ELIMINA", activeExerciseId);
    // TODO: qui agganceremo la delete reale sullo store/db
    closeActions();
  }

  // ⚠️ Per ora “agganciamo” il giorno selezionato ai tuoi planDays.
  // Assunzione: in planDays hai un campo "weekday" oppure un id coerente.
  // Se non ce l'hai, sotto ti metto 2 opzioni per mapparlo.
  const day =
    client?.planDays?.find((d: any) => d.weekday === selectedDay) ??
    client?.planDays?.find((d: any) => d.id === selectedDay) ??
    null;

  const exercises = day?.exercises ?? [];

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title={client ? client.name : "Allievo"} showBack subtitle="Scheda allenamento" />

        {!client ? (
          <Text style={{ color: theme.colors.subtext }}>Allievo non trovato.</Text>
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
                  // Per ora placeholder: in step dopo ci agganciamo a add-exercise
                  console.log("TODO: aggiungi esercizio");
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
                <Text style={{ color: theme.colors.subtext }}>
                  Nessun esercizio per questo giorno.
                </Text>
              ) : (
                exercises.map((ex: any) => (
                  <Pressable
                    key={ex.id}
                    onPress={() => {
                      router.push({
                        pathname: "/(pt-tabs)/students/[clientId]/exercise/[exerciseId]",
                        params: {
                          clientId: String(clientId),
                          exerciseId: String(ex.id),
                          weekday: selectedDay,
                        },
                      });
                    }}
                    style={{ borderRadius: theme.radius.lg }}
                  >
                    <Card>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        {/* Placeholder immagine esercizio */}
                        <View
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 10,
                            backgroundColor: theme.colors.border,
                            alignItems: "center",
                            justifyContent: "center",
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
                            {ex.sets} serie × {ex.reps} reps • Rec {ex.restSec}s
                          </Text>

                          {ex.notes ? (
                            <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>
                              Note: {ex.notes}
                            </Text>
                          ) : null}
                        </View>

                        {/* 3 puntini */}
                        <Pressable
                          onPress={(e: any) => {
                            e?.stopPropagation?.();
                            console.log("APRI AZIONI ESERCIZIO", ex.id);
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

        {/* Action sheet (cross-platform, works on Web + Expo Go) */}
        <Modal
          visible={actionsOpen}
          transparent
          animationType="fade"
          onRequestClose={closeActions}
        >
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
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onEdit();
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Modifica</Text>
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onDelete();
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#ff5a5a", fontWeight: "900", fontSize: 16 }}>Elimina</Text>
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e?.stopPropagation?.();
                  closeActions();
                }}
                style={{
                  marginTop: 6,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
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